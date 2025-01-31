export const getBrowserDisplay = async (c) => {
    return c.html(`<html>
<head>
<script src="https://unpkg.com/konva@9/konva.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
<style>
html, body, div, span, object, iframe,
h1, h2, h3, h4, h5, h6, p, blockquote, pre,
abbr, address, cite, code,
del, dfn, em, img, ins, kbd, q, samp,
small, strong, sub, sup, var,
b, i,
dl, dt, dd, ol, ul, li,
fieldset, form, label, legend,
table, caption, tbody, tfoot, thead, tr, th, td,
article, aside, canvas, details, figcaption, figure,
footer, header, hgroup, menu, nav, section, summary,
time, mark, audio, video {
    margin:0;
    padding:0;
    border:0;
    outline:0;
    font-size:100%;
    vertical-align:baseline;
}

body {
    line-height:1;
    background-color: #dcdcdc;
}
</style>
<div id="container"></div>
<script>

    const paddingLeft = 2;
    const paddingTop = 2;
    const radius = 5;
    const updateInterval = 100;


    axios.get('/api/display')
        .then(function (response) {
            const data = response.data;

            const totalWidth = (((data.width+1)*(radius + paddingLeft)))*2
            const totalHeight = (((data.height+1)*(radius + paddingTop)))*2
            const left = (window.innerWidth - totalWidth)/2;
            const right = (window.innerHeight - totalHeight)/2;

            var stage = new Konva.Stage({
                container: 'container',
                width: totalWidth + left,
                height: totalHeight + right,
                x: left,
                y: right,
            });
            var layer = new Konva.Layer();

            const Dots = [];

            const border = new Konva.Rect({width: totalWidth, height: totalHeight, fill: 'black', stroke: 'white', strokeWith: 0});
            layer.add(border)
            for(var y=0 ; y<data.height ; y++) {
                Dots[y] = [];
                for(var x=0 ; x<data.width ; x++) {
                    Dots[y][x] = new Konva.Circle({
                        radius: radius,
                        fill: data.content[y][x] === 0 ? 'black' : 'white',
                        stroke: data.content[y][x] === 0 ? 'black' : 'white',
                        strokeWidth: 0
                    });
                    Dots[y][x].absolutePosition({
                        x: (((x+1)*(radius + paddingLeft))*2),
                        y: (((y+1)*(radius + paddingTop))*2),
                    });
                    layer.add(Dots[y][x]);
                }
            }
            stage.add(layer);

            setInterval(() => {
                axios.get('/api/display')
                    .then(function (response) {
                        const data = response.data;
                        for(var y=0 ; y<data.height ; y++) {
                            for(var x=0 ; x<data.width ; x++) {
                                Dots[y][x].fill(data.content[y][x] === 0 ? 'black' : 'white');
                                Dots[y][x].stroke(data.content[y][x] === 0 ? 'black' : 'white');
                            }
                        }
                    })
                    .catch(function (error) {
                        // handle error
                        console.log(error);
                    })
        }, updateInterval);
        })
        .catch(function (error) {
            // handle error
            console.log(error);
        })




</script>
</head>
<body>
</body>
</html>`);
}