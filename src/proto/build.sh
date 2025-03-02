protoc \
  --plugin=protoc-gen-ts_proto=$(npx which protoc-gen-ts_proto) \
  --ts_proto_out=./ \
  --ts_proto_opt=esModuleInterop=true \
  -I=./ \
  ./*.proto
