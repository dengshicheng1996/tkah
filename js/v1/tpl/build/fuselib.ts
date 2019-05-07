import {
    BabelPlugin, CSSPlugin, CSSResourcePlugin, EnvPlugin,
    FuseBox, JSONPlugin, LESSPlugin, ReplacePlugin, SassPlugin,
    UglifyESPlugin, UglifyJSPlugin, WebIndexPlugin,
} from 'fuse-box';
import * as fusebox from 'fuse-box';
import {
    BundleSource,
} from 'fuse-box/BundleSource';

import * as crypto from 'crypto';
import { walkSync } from 'file';
import * as fs from 'fs-extra';
import * as proxy from 'http-proxy-middleware';
import * as mkdirp from 'mkdirp';
import * as path from 'path';
import { typeCheck as realTypeCheck } from './typecheck';
import { hrtimeToSeconds } from './utils';
const zlib = require('zlib');

const argv = require('minimist')(process.argv.slice(2));

const versionRoot = path.join(__dirname, '../../');
const projectRoot = path.join(versionRoot, '../../');
const tplRoot = path.join(versionRoot, 'tpl/');
const distRoot = path.join(projectRoot, 'dist/');
const cacheRoot = process.env.FUSE_CACHE_DIR || path.join(versionRoot, 'node_modules/.cache');

function exitWithUsage() {
    console.log('Usage: node fuse.js <app name regex> [--production]');
    process.exit(1);
}

const tplDirs = fs.readdirSync(tplRoot);

function typeCheck(files: string[], opt: { strict: boolean }) {
    if (argv['fast']) {
        return;
    }
    realTypeCheck(tplRoot, files, opt);
}

function sha1(data) {
    const generator = crypto.createHash('sha1');
    generator.update(data);
    return generator.digest('hex');
}

const FixFuseboxIE8 = {
    postBundle(context) {
        const includeSourceMaps = context.source.includeSourceMaps;
        const concat = context.source.getResult();
        const source = concat.content.toString();
        const sourceMap = concat.sourceMap;
        const newSource = new BundleSource(context);
        newSource.includeSourceMaps = includeSourceMaps;
        context.source = newSource;
        const newConcat = context.source.getResult();
        // Hack to make fusebox output to support ie8.
        const source2 = source.replace(/\.import\(/, '["import"](');
        newConcat.add(null, source2, sourceMap);
    },
};

const Base64Plugin = {
    test: /\.docx$/,
    extensions: ['.docx'],

    init(context) {
        this.extensions.forEach(ext => context.allowExtension(ext));
    },
    transform: (file) => {
        file.isLoaded = true;
        const content = fs.readFileSync(file.absPath);
        // convert binary data to base64 encoded string
        const data = new Buffer(content).toString('base64');
        file.contents = `module.exports = ${JSON.stringify(data)}`;
    },
};

let cacheDirCreated = false;

function lookupOrInsertCache(hash: string, gen: () => string): string {
    const cacheDir = cacheRoot + '/compressed';
    if (!cacheDirCreated) {
        mkdirp.sync(cacheRoot + '/compressed');
        cacheDirCreated = true;
    }
    const cacheFile = path.join(cacheDir, hash);
    if (fs.existsSync(cacheFile)) {
        console.log(`Compression cached.`);
        return fs.readFileSync(cacheFile).toString();
    }
    const content = gen();
    fs.writeFileSync(cacheFile, content);
    return content;
}

const CachedCompress = () => {
    return {
        postBundle(context) {
            const opt: any = {
                compress: {
                    arguments: false,
                    collapse_vars: false,
                    dead_code: true,
                    hoist_props: false,
                    inline: false,
                    loops: false,
                    reduce_funcs: false,
                    reduce_vars: false,
                    if_return: false,
                    unused: false,
                    switches: false,
                },
                mangle: {
                    ie8: true,
                },
                output: {
                    ie8: true,
                },
            };
            const UglifyJs = require('uglify-js');
            if (UglifyJs.mangle_properties !== undefined) {
                opt.fromString = true;
            }
            const concat = context.source.getResult();
            const source = concat.content.toString().replace(
                /process\.env\.NODE_ENV/g, '\'production\'').replace(
                    'let d = document', 'var d = document');  // fix https://github.com/fuse-box/fuse-box/pull/1439/files
            const newSource = new BundleSource(context);
            context.source = newSource;
            const newConcat = context.source.getResult();
            const key = sha1(source);
            const newSourceStr = lookupOrInsertCache(key, () => {
                const timeStart = process.hrtime();
                const result = UglifyJs.minify(source, opt);
                if (result.error) {
                    if (result.error.name === 'SyntaxError') {
                        console.log('The following lines might have errors:');
                        console.log(source.substr(result.error.pos - 50, 100));
                    }
                    const message = `CachedCompress - ${result.error.message}`;
                    context.log.echoError(message);
                    throw result.error;
                }
                const ret = result.code.replace(/\.import\(/, '["import"](');
                const took = process.hrtime(timeStart);
                const bytes = Buffer.byteLength(ret, 'utf8');
                console.log(`Compress took ${hrtimeToSeconds(took)}s, size: ${bytes / 1024} kb.`);
                context.log.echoBundleStats('Bundle (Uglified)', bytes, took);
                return ret;
            });
            newConcat.add(null, newSourceStr, null);
        },
    };
};

function buildOne(prj: Project) {
    const isProduction = !!argv['production'] || process.env.NODE_ENV === 'production' || false;
    const useHash = isProduction || (!!argv['hash'] || process.env.NODE_ENV === 'hash' || false);
    const verbose = !!argv['verbose'] || false;
    const watch = argv['watch'] || false;

    if (watch && isProduction) {
        console.error('cannot watch in production mode.');
        process.exit(1);
    }

    console.log('Building', prj.name);
    console.time(`Built ${prj.name}`);

    const timeEnd = () => {
        console.timeEnd(`Built ${prj.name}`);
    };
    const Echo = {
        transform: (file, ast) => {
            if (!verbose) {
                return;
            }
            console.log('Processing: ', file.info.absPath);
        },
    };

    const plugins: any[] = [
        EnvPlugin({
            NODE_ENV: isProduction ? 'production' : 'development',
        }),
        [Base64Plugin],
        ['.json', JSONPlugin()],
        [/.*\.css/, Echo, CSSResourcePlugin({ inline: true }), CSSPlugin()],
        [/.sass|.scss/, SassPlugin({
            indentedSyntax: true,  // sass or scss.
            includePaths: [
                `${versionRoot}/node_modules/compass-mixins/lib`,
            ],
        }), CSSPlugin()],
        ['.less', LESSPlugin(({
            javascriptEnabled: true,
            paths: [
                path.resolve(versionRoot, 'node_modules'),
                tplRoot,
            ],
        }) as any), CSSPlugin()],
    ];

    const alias = {};
    tplDirs.forEach(dir => {
        alias[dir] = `~/${dir}`;
    });

    alias['~/component-indexof.js'] = 'component-indexof';
    if (prj.alias) {
        Object.keys(prj.alias).forEach(key => {
            alias[key] = prj.alias[key];
        });
    }

    if (isProduction) {
        plugins.push([
            /.*\.jsx?/,
            BabelPlugin(),
        ]);
        plugins.push([
            ReplacePlugin({
                'PRODUCTION': 'true',
                'process.env.NODE_ENV': '\'production\'',
            }),
            CachedCompress(),
            // UglifyESPlugin(),
        ]);
    } else {
        plugins.push(ReplacePlugin({
            'PRODUCTION': 'false',
            'process.env.NODE_ENV': '\'development\'',
        }));
    }

    const outputDir = path.join(distRoot, prj.name);

    const fuse = FuseBox.init({
        homeDir: tplRoot,
        output: path.join(outputDir, useHash ? '$name_$hash.js' : '$name.js'),
        plugins,
        tsConfig: path.join(versionRoot, 'tsconfig.json'),
        hash: useHash,
        cache: !!argv['fast'] || !isProduction,
        debug: verbose,
        log: verbose || watch,
        alias,
        sourceMaps: !isProduction,
    });

    process.env.NODE_ENV = isProduction ? 'production' : 'development';

    plugins.push(
        WebIndexPlugin({
            title: `${distRoot}${prj.dir}`,
            template: `${prj.sourceDir()}/index.devserver.html`,
            appendBundles: true,
            resolve: output => {
                return isProduction ? `/${prj.name}/${output.lastPrimaryOutput.filename}` : output.lastPrimaryOutput.filename;
            },
        }));

    if (watch) {
        fuse.dev({
            proxy: {
                '/api': {
                    target: 'https://jsonplaceholder.typicode.com',
                    changeOrigin: true,
                    pathRewrite: {
                        '^/api': '/',
                    },
                },
            },
            port: 8088,
            // httpServer: false,
        });
    }

    const wrapBundle = (bundle) => {
        bundle = bundle.target('browser');
        if (!watch) {
            return bundle;
        }
        return bundle.watch();
    };

    const wrapVendor = (bundle) => {
        const b = wrapBundle(bundle);
        if (watch) {
            b.hmr({ socketURI: 'ws://localhost:8088' });
        }
    };

    switch (prj.mode) {
        case 'spa':
            typeCheck([`${prj.sourceDir()}/index.tsx`], { strict: prj.strict });
            wrapVendor(fuse.bundle('vendor')
                .instructions(`> common/init.js ~ ${prj.dir}/index.tsx`));
            wrapBundle(fuse.bundle('app')
                .instructions(`!> [${prj.dir}/index.tsx]`));
            break;
        case 'mpa':
            const vendors = ['> common/init.js'];
            const tsFiles = [];

            walkSync(prj.sourceDir(), (dirPath, unused, files) => {
                const relDirPath = path.relative(prj.sourceDir(), dirPath);
                files.forEach((f) => {
                    const m = f.match('^(page_.*)\.[tj]sx?$');
                    if (!m) {
                        return;
                    }
                    const entryFile = path.join(dirPath.slice(tplRoot.length), f);
                    wrapBundle(fuse.bundle(path.join(relDirPath, m[1]))
                        .instructions(`!> [${entryFile}]`));
                    vendors.push(`~ ${entryFile}`);
                    tsFiles.push(path.join(dirPath, f));
                });
            });
            typeCheck(tsFiles, { strict: prj.strict });
            wrapVendor(fuse.bundle('vendor').instructions(vendors.join(' ')));
            break;
        default: const _: never = prj.mode;
    }

    return fuse.run().then(async producer => {
        const gzip = zlib.createGzip();

        const assets = {
            files: {},
        };

        producer.bundles.forEach((bundle, name) => {
            const pa = path.relative(
                outputDir,
                bundle.context.output.lastPrimaryOutput.path);
            assets.files[name + '.js'] = pa;

            if (isProduction) {
                const r = fs.createReadStream(`${outputDir}/${pa}`);
                const w = fs.createWriteStream(`${outputDir}/${pa}.gz`);
                r.pipe(gzip).pipe(w);
            }
        });
        timeEnd();
        await fs.writeFile(
            path.join(outputDir, 'assets.json'),
            JSON.stringify(assets, null, 2));
    });
}

function serial(promiseCreators) {
    return promiseCreators.reduce((prev, creator) => {
        return prev.then(r => {
            return creator().then(v => {
                r.push(v);
                return r;
            });
        });
    }, Promise.resolve([]));
}

function main(projects: { [name: string]: Project }) {
    const app = argv._[0];

    if (!app) {
        exitWithUsage();
    }

    const prjs = (() => {
        const pattern = new RegExp(`^${app}$`);
        return Object.keys(projects).filter(name => {
            return name.match(pattern);
        }).map(name => {
            return projects[name];
        });
    })();

    if (argv['list']) {
        prjs.forEach(prj => {
            console.log(prj.name);
        });
        process.exit(0);
        return;
    }

    if (prjs.length === 0) {
        console.error('No matching projects: ', app);
        process.exit(1);
    }

    if (!argv['fast'] && !argv['no_strict_common_check']) {
        fs.removeSync(versionRoot + '/.fusebox');
        realTypeCheck(tplRoot, [`${tplRoot}/common/**/*`], { strict: true });
    }

    serial(prjs.map(prj => {
        return () => buildOne(prj);
    })).catch(err => {
        console.error(err);
        process.exit(1);
    });
}

class Project {
    name: string;
    mode: 'spa' | 'mpa';  // single-page-app or multi-page-app.
    strict: boolean;
    dir: string;
    alias?: { [key: string]: string };

    constructor(fields: {
        name: string,
        mode: 'spa' | 'mpa',
        strict: boolean,
        dir: string,
        alias?: { [key: string]: string };
    }) {
        Object.assign(this, fields);
    }

    sourceDir = () => {
        return `${tplRoot}/${this.dir}`;
    }
    testSourceDir = () => {
        return `${tplRoot}/${this.dir}/tests`;
    }
}

class Spec {
    projects: { [name: string]: Project } = {};

    AddSPA = (name, opts?: { dir?: string, unstrict?: boolean }) => {
        opts = opts || {};
        const dir = opts.dir || name;
        const unstrict = opts.unstrict || false;
        const prj = new Project({
            name,
            dir,
            strict: !unstrict,
            mode: 'spa',
        });
        this.projects[name] = prj;
        return prj;
    }

    AddPaged = (name, dir?) => {
        dir = dir || name;
        const prj = new Project({
            name,
            dir,
            mode: 'mpa',
            strict: true,
        });
        this.projects[name] = prj;
        return prj;
    }
    Run = () => {
        main(this.projects);
    }
}

export const NewSpec = () => {
    return new Spec();
};
