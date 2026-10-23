import { createServer } from 'vite'

// Shared by the Chrome and cross-engine runners, including the one-shot
// stylesheet failure exercised by the X3DOM recovery fixture.
export const browserServer = root => createServer({
  root, configFile: false, logLevel: 'error',
  server: { host: '127.0.0.1', port: 0 },
  plugins: [{
    name: 'x3dom-stylesheet-failure',
    configureServer(server) {
      let failed = false
      server.middlewares.use((request, response, next) => {
        if (!failed && request.url?.endsWith('/vendor/x3dom.css')
            && request.headers.referer?.endsWith('/x3dom-failure.html')) {
          failed = true
          response.writeHead(503, { 'Cache-Control': 'no-store' })
          response.end('Stylesheet temporarily unavailable')
        } else next()
      })
    }
  }]
})
