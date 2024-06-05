// vite.config.ts
import glsl from 'vite-plugin-glsl';
import { defineConfig } from 'vite';

export default defineConfig({
    base: './',
    resolve: {
        alias: {'@':'src'}
    },
    plugins: [
        glsl({
            include: [                   // Glob pattern, or array of glob patterns to import
                '**/*.glsl', '**/*.wgsl',
                '**/*.vert', '**/*.frag',
                '**/*.vs', '**/*.fs', '/src/demo-case/*.ts'
            ],
            defaultExtension:"ts"
        })],
    server:{
        host:'0.0.0.0',
        port:7880
    }
});