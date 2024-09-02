const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { ZipkinExporter } = require('@opentelemetry/exporter-zipkin');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');

function initTracer() {
    const provider = new NodeTracerProvider();
    provider.register();

    const exporter = new ZipkinExporter({
        url: process.env.ZIPKIN_URL || 'http://localhost:9411/api/v2/spans'
    });

    provider.addSpanProcessor(new SimpleSpanProcessor(exporter));

    registerInstrumentations({
        instrumentations: [
            new HttpInstrumentation()
        ],
    });
}

module.exports = { initTracer };
