#SCRIPT_DIR=`pwd`
SCRIPT_DIR=$(cd $(dirname $0); pwd)
cd $1
TAMES_CONFIG_PATH=${SCRIPT_DIR}/config.json lein ring server-headless
