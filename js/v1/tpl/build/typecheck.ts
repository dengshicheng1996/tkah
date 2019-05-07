import chalk from 'chalk';
import * as path from 'path';
import * as ts from 'typescript';

const projectRoot = path.join(__dirname, '../../');

export function typeCheck(basePath, files, opts: { strict: boolean }) {
    const tsConfig = {
        compilerOptions: {
            skipLibCheck: true,
            allowJs: true,
            sourceMap: true,
            // TODO: switch to just 'strict'.
            noImplicitAny: opts.strict,
            experimentalDecorators: true,
            module: 'commonjs',
            target: 'es5',
            baseUrl: basePath,
            jsx: 'react',
            lib: ['es2015.promise', 'dom', 'es2017'],
            outDir: '/tmp/phantom',
            allowSyntheticDefaultImports: true,
            paths: {
                '*': [
                    '../typings/*',
                    './*',
                ],
            },
        },
        include: files,
    };

    const parseConfigHost = {
        fileExists: ts.sys.fileExists,
        readDirectory: ts.sys.readDirectory,
        readFile: ts.sys.readFile,
        useCaseSensitiveFileNames: true,
    };
    const config = ts.parseJsonConfigFileContent(tsConfig, parseConfigHost, basePath);
    const program = ts.createProgram(config.fileNames, config.options);
    const diagnostics = ts.getPreEmitDiagnostics(program);

    if (diagnostics.length > 0) {
        const write = ts.sys.write;
        write(chalk.underline(`\nFile errors`) + chalk.white(':') + '\n');
        diagnostics.forEach((diag) => {
            // get message type error, warn, info
            write(chalk.red('└── '));

            // if file
            if (diag.file) {
                const {
                    line,
                    character,
                } = diag.file.getLineAndCharacterOfPosition(diag.start);

                write(chalk.red(`./${path.relative(projectRoot, diag.file.fileName)}:${line + 1}:${character + 1}:\t`));
                write(chalk.white(ts.DiagnosticCategory[diag.category]));
                write(chalk.white(` TS${diag.code}:`));
            }

            // flatten error message
            write(' ' + ts.flattenDiagnosticMessageText(diag.messageText, '\n') + '\n');
        });
        throw new Error('Typescript type checking failed.');
    }
}
