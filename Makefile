# 仅在 Build 服务器使用
build_production:
	yarn config set registry 'https://registry.npm.taobao.org'
	cd js/v1 && \
	yarn && \
	$(shell pwd)/js/v1/node_modules/.bin/ts-node $(shell pwd)/js/v1/tpl/build/fuse_prod.ts
.PHONY: build_production

# 仅在 Build 服务器使用
build_dev:
	# yarn config set registry 'https://registry.npm.taobao.org'
	cd js/v1 && \
	yarn && \
	node $(shell pwd)/js/v1/tpl/build/fuse.js ".*" --nginx --hash
.PHONY: build_dev

local_build_production:
	cd js/v1 && \
	yarn && \
	./node_modules/.bin/ts-node ./tpl/build/fuse_prod.ts && \
	cd ../../ && \
	git add -A && \
	git commit -m 'Build'  && \
	git push && \
	sh ./scripts/create_tag.sh
.PHONY: local_build_production

build_tag:
	sh ./scripts/create_tag.sh
.PHONY: build_tag

fuse:
	cd js/v1 && \
	yarn && \
	node ./tpl/build/fuse.js ".*" --hash
.PHONY: fuse

fuse_watch:
	cd js/v1 && \
	yarn && \
	node ./tpl/build/fuse.js ".*" --watch
.PHONY: fuse_watch

fuse_prod:
	cd js/v1 && \
	yarn && \
	./node_modules/.bin/ts-node ./tpl/build/fuse_prod.ts && \
	cd ../../ && \
	git add -A && \
	git commit -m 'Build'  && \
	git push
.PHONY: fuse_prod
