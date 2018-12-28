const fs = require('fs');

const Koa = require('koa');
const Router = require('koa-router');
const Assets = require('koa-static');
const BodyParser = require('koa-bodyparser');

const marked = require('marked');
const hljs = require('highlight.js');

const app = new Koa();
const router = new Router();

function md2html(mdStr) {
    let renderer = new marked.Renderer();
    renderer.heading = function (text, level) {
        const header = `
            <h${level} class="title" data-index="${index}">
                <span>${text}</span>
            </h${level}>
        `;
        return header;
    };

    renderer.paragraph = function (text) {
        return `<p>${text}</p>`;
    };

    renderer.blockquote = function (text) {
        return `<blockquote>${text}</blockquote>`;
    };

    renderer.list = function (body, ordered, start) {
        const tag = ordered ? 'ol' : 'ul';
        return `<${tag}>${body}</${tag}>`;
    };

    renderer.listitem = function (text) {
        return `<li><p style="box-sizing: inherit; line-height: 1.75;font-size:14px !important;">${text}</p></li>`;
    };

    renderer.link = function (href, title, text) {
        return `<a href="${href}" target="_blank">${text}</a>`;
    };

    renderer.code = function (code, language, escaped) {
        code = code || '';
        const rows = code.split(/[\n\r]/);
        const rowsHtml = rows.map(r => {
            const res = hljs.highlight(language, r).value.replace(/^(\s+)/g, function ($, $1) {
                return new Array($1.length + 1).join('&nbsp;');
            });
            return `<p style="margin-top: 3px;margin-bottom: 3px;border-width: 0px;border-style: initial;border-color: initial;line-height: 16px;font-size: 12px;text-align: justify;word-break: break-all;overflow-wrap: break-word;hyphens: auto;white-space: nowrap !important;">${res}</p>`;
        });
        return `<blockquote style="padding: 0;border-width: 0px;border-style: initial;border-color: initial;padding-left: 0px;color: rgb(51, 51, 51);white-space: normal;">
            <pre style="border-width: 0px;border-style: initial;border-color: initial;padding: 1em;overflow: auto;background-color: rgb(45, 45, 45);color: rgb(204, 204, 204);font-family: Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace;max-width: 100%;overflow-wrap: normal;word-spacing: normal;word-break: normal;line-height: 1.5;tab-size: 4;hyphens: none;box-sizing: border-box !important;">${rowsHtml.join('')}</pre>
        </blockquote>`;
    };

    const options = {
        renderer: renderer,
        gfm: true,
        tables: true,
        breaks: false,
        pedantic: false,
        sanitize: false,
        smartLists: true,
        smartypants: true
    };
    marked.setOptions(options);

    return marked(mdStr);
}

router.get('/', (ctx, next) => {
    ctx.type = 'text/html';
    ctx.body = fs.readFileSync('./views/index.html');
}).post('/prev', (ctx, next) => {
    const bd = ctx.request.body;
    let md = bd.md || '';
    ctx.type = 'application/json';
    ctx.body = {html: md2html(md)};
});

app.use(Assets('./static', {gzip: true}))
    .use(BodyParser())
    .use(router.routes())
    .use(router.allowedMethods());

app.listen(3001);

console.log('Server is running at: http://localhost:3001');
