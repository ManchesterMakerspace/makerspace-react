upload_screenshots:
	yarn install --production=false && node tests/uploadScreenshots.js

deploy:
	yarn install --production=false
	yarn build
	node scripts/release.js

integration:
	yarn install --production=false
	yarn build
	node scripts/integration.js