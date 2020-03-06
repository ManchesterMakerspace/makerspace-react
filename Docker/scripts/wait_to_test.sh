#!/bin/bash
# set -e

max_wait_seconds=300
if [ "${LOCAL}" == "TRUE" ]; then
  echo "Setting --interactive local env"
  API_DOMAIN=http://0.0.0.0:1080
  APP_DOMAIN=0.0.0.0
  PORT=3035
  MOCKSERVER_DOMAIN=0.0.0.0
fi

app="http://${APP_DOMAIN}:${PORT}"
if [ -z "${PORT}" ]; then
  app="http://${APP_DOMAIN}"
fi

echo "Waiting.."
if [ ${SELENIUM_ADDRESS} ]; then
  echo "Waiting for selenium to start..."
  while true; do
    if ! curl --output /dev/null --silent --head --fail "${SELENIUM_ADDRESS}" > /dev/null 2>&1; then
      sleep 1;
      ((max_wait_seconds--))
      ((max_wait_seconds%15==0)) && echo "...waiting for selenium at ${SELENIUM_ADDRESS}"
      ((max_wait_seconds == 0)) && echo "FAILED waiting for selenium at ${SELENIUM_ADDRESS}" && exit 1
    else
      echo "Selenium ready"
      break
    fi
  done
fi

echo "Waiting for application to start..."
while [[ "$(curl -s -o /dev/null -w ''%{http_code}'' ${app})" != "200" ]]; do
    sleep 5;
    ((max_wait_seconds-=5))
    ((max_wait_seconds%15==0)) && echo "...waiting for application at ${app}"
    ((max_wait_seconds == 0)) && echo "FAILED waiting for application at ${app}" && exit 1
done
echo "Application ready"

echo "# All containers ready."
if [ "${INTERACTIVE}" == "TRUE" ]; then
  echo "Dev available"
  echo "Selenium: 0.0.0.0:4444/wd/hub"
  echo "App: ${app}"
  /bin/bash
else
  echo "Interactive: ${INTERACTIVE}"
  cd /usr/src/app && echo "Starting testing..."
  if [ ${SELENIUM_ADDRESS} ]; then
    if [ "${CONFIG}" == "integration" ]; then
      yarn test-integration
    else
      yarn test-functional
    fi
  else
    yarn test
  fi
fi
