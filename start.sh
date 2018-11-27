CURRENT_PATH=`pwd`
cd $1
TAMES_CONFIG_PATH=${CURRENT_PATH}/config.json lein ring server-headless
#TAMES_CONFIG_PATH=../tames.nenga/config.json lein ring server-headless
