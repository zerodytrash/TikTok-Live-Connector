echo "Building Protobuf Web-Compatible Variant"
cd ./src

protoc \
  --plugin=protoc-gen-ts_proto=$(npx which protoc-gen-ts_proto) \
  --ts_proto_out=../web_dist \
  --ts_proto_opt=env=browser \
  --ts_proto_opt=forceLong=string \
  --ts_proto_opt=outputPartialMethods=false \
  --ts_proto_opt=snakeToCamel=true \
  --ts_proto_opt=outputJsonMethods=false \
  --ts_proto_opt=esModuleInterop=true \
  -I=./ \
  ./*.proto
