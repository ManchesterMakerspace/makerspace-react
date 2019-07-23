PROJECT_NAME=mmsreact
DC_DEV=docker-compose -f Docker/docker-compose/dev.yml -p $(PROJECT_NAME)
DC_FUNCTIONAL=docker-compose -f Docker/docker-compose/functional.yml -p $(PROJECT_NAME)
DC_INTEGRATION=docker-compose -f Docker/docker-compose/integration.yml -p $(PROJECT_NAME)

start: dev-up
test: clean-test test-up functional-up
upload_screenshots: 
	node tests/uploadScreenshots.js
deploy: 
	node scripts/release.js


start-func: clean-test functional-up
start-func-dev: clean-test functional-up-interactive
start-func-local: clean-test functional-up-interactive-local
start-int: clean-test integration-up
start-int-dev: clean-test integration-up-interactive
start-int-local: clean-test integration-up-interactive-local

rebuild-func: clean-test build-up-functional
rebuild-func-dev: clean-test build-up-functional-interactive
rebuild-func-local: clean-test build-up-functional-interactive-local
rebuild-int: clean-test build-up-integration
rebuild-int-dev: clean-test build-up-integration-interactive
rebuild-int-local: clean-test build-up-integration-interactive-local

clean-dev:
	${DC_DEV} rm -f

build-up-dev:
	${DC_DEV} up --build

dev-up:
	${DC_DEV} up

clean-test:
	${DC_FUNCTIONAL} rm -f
	${DC_INTEGRATION} rm -f

functional-up:
	${DC_FUNCTIONAL} up --exit-code-from tester
build-up-functional:
	${DC_FUNCTIONAL} up --build --exit-code-from tester
functional-up-interactive:
	INTERACTIVE=TRUE ${MAKE} functional-up
build-up-functional-interactive:
	INTERACTIVE=TRUE ${MAKE} build-up-functional
functional-up-interactive-local:
	LOCAL=TRUE ${MAKE} functional-up-interactive
build-up-functional-interactive-local:
	LOCAL=TRUE ${MAKE} build-up-functional-interactive


integration-up:
	${DC_INTEGRATION} up --exit-code-from tester
build-up-integration:
	${DC_INTEGRATION} up --build --exit-code-from tester
integration-up-interactive:
	INTERACTIVE=TRUE ${MAKE} integration-up
build-up-integration-interactive:
	INTERACTIVE=TRUE ${MAKE} build-up-integration
integration-up-interactive-local:
	LOCAL=TRUE	${MAKE} integration-up-interactive
build-up-integration-interactive-local:
	LOCAL=TRUE ${MAKE} build-up-integration-interactive

# These functions are for running Yarn functional tests manually with docker interactive containers.
# Can be used with Docker or Local Selenium instance.
# The yarn environment also sets the mockserver-client and test environment.  If Selenium is running locally, we need
# to set APP to the local domain because they are in the same scope and vice versa.  However, MOCKSERVER is
# always set to the local domain because it is scoped to yarn, which is running locally in.
MOCKSERVER_DOMAIN=0.0.0.0
SELENIUM_ADDRESS=http://0.0.0.0:4444/wd/hub
APP_DOCKER_DOMAIN=react
APP_LOCAL_DOMAIN=0.0.0.0
FUNC_DOCKER=bash -c "SELENIUM_ADDRESS=${SELENIUM_ADDRESS} MOCKSERVER_DOMAIN=${MOCKSERVER_DOMAIN} APP_DOMAIN=${APP_DOCKER_DOMAIN} yarn test-functional"
FUNC_LOCAL=bash -c "MOCKSERVER_DOMAIN=${MOCKSERVER_DOMAIN} APP_DOMAIN=${APP_LOCAL_DOMAIN} yarn test-functional"

INT_DOCKER=bash -c "SELENIUM_ADDRESS=${SELENIUM_ADDRESS} APP_DOMAIN=${APP_DOCKER_DOMAIN} yarn test-integration"
INT_LOCAL=bash -c "APP_DOMAIN=${APP_LOCAL_DOMAIN} yarn test-integration"
test-functional:
	${FUNC_DOCKER}
test-functional-local:
	${FUNC_LOCAL}
test-integration:
	${INT_DOCKER}
test-integration-local:
	${INT_LOCAL}
