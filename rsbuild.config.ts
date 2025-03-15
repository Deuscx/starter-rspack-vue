import path from 'node:path'
import { defineConfig } from '@rsbuild/core'
import { pluginVue } from '@rsbuild/plugin-vue'
import { UnoCSSRspackPlugin as UnoCSS } from '@unocss/webpack/rspack'
import { RspackVirtualModulePlugin } from 'rspack-plugin-virtual-module'
import AutoImport from 'unplugin-auto-import/webpack'
import Components from 'unplugin-vue-components/webpack'
import { createRoutesContext, VueRouterAutoImports } from 'unplugin-vue-router'
// import VueRouter from 'unplugin-vue-router'
import { resolveOptions } from 'unplugin-vue-router/options'

export default defineConfig({
  resolve: {
    alias: {
      '~/': `${path.resolve(__dirname, 'src')}/`,
    },
  },
  plugins: [
    pluginVue(),
  ],
  dev: {
    // windows unplugin-vue-router not support hmr, so reload server
    watchFiles: {
      type: 'reload-server',
      paths: ['./typed-router.d.ts'],
    },
  },
  tools: {
    async rspack(config) {
      // https://github.com/posva/unplugin-vue-router/issues/496
      const { scanPages, generateRoutes } = createRoutesContext(resolveOptions({ }))

      await scanPages()

      // for windows  https://github.com/web-infra-dev/rspack/issues/7787
      config.plugins?.push(new RspackVirtualModulePlugin({
        'vue-router/auto-routes': generateRoutes(),
      }))

      // config.plugins?.push(VueRouter.rspack())
      config.plugins?.push(
        AutoImport({
          imports: [
            'vue',
            '@vueuse/core',
            VueRouterAutoImports,
            {
              // add any other imports you were relying on
              'vue-router/auto': ['useLink'],
            },
          ],
          dts: true,
          dirs: [
            './src/composables',
          ],
          vueTemplate: true,
        }),

        // https://github.com/antfu/vite-plugin-components
        Components({
          dts: true,
        }),

        // https://github.com/antfu/unocss
        // see uno.config.ts for config
        UnoCSS(),
      )
    },
  },
})
