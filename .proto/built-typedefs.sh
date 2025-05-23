protoc \
  --plugin=protoc-gen-ts_proto=$(npx which protoc-gen-ts_proto) \
  --ts_proto_out=./types \
  --ts_proto_opt=forceLong=string \
  --ts_proto_opt=env=browser \
  --ts_proto_opt=esModuleInterop=true \
  --ts_proto_opt=outputServices=none \
  --ts_proto_opt=outputEncodeMethods=false \
  --ts_proto_opt=outputJsonMethods=false \
  -I=./ \
  ./*.proto
