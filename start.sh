echo ==============================
echo config file path
echo ==============================
SCRIPT_DIR=$(cd $(dirname $0); pwd)
CONFIG_PATH=${SCRIPT_DIR}/config.json
echo [${CONFIG_PATH}]
echo 

echo ==============================
echo tames directory relative path
echo ==============================
TAMES_DIR_PATH=$1
if test "${TAMES_DIR_PATH}" = "" ; then
  read -p "Input tames directory relative path >> " TAMES_DIR_PATH
fi
echo [${TAMES_DIR_PATH}]
echo 

echo ==============================
echo port number
echo ==============================
NENGA_PORT=$2
if test "${NENGA_PORT}" = "" ; then
  read -p "Input nenga port number >> " NENGA_PORT
fi
echo [${NENGA_PORT}]
echo 

cd ${TAMES_DIR_PATH}

TAMES_CONFIG_PATH=${CONFIG_PATH} lein ring server-headless ${NENGA_PORT}
