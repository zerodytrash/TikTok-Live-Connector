
echo "Building Protobuf TypeScript API for TikTok-Live-Connector"
cd ./src

protoc \
  --plugin=protoc-gen-ts_proto=$(npx which protoc-gen-ts_proto) \
  --ts_proto_out=../../src/types/tiktok \
  --ts_proto_opt=forceLong=string \
  --ts_proto_opt=outputPartialMethods=true \
  --ts_proto_opt=snakeToCamel=true \
  --ts_proto_opt=outputJsonMethods=false \
  --ts_proto_opt=esModuleInterop=true \
  -I=./ \
  ./*.proto
