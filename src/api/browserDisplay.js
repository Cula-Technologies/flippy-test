export const getBrowserDisplay = async (c) => {
    return c.html(`<html>
<head>
<script src="https://unpkg.com/konva@9/konva.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
<div id="container"></div>
<script>

    const paddingLeft = 2;
    const paddingTop = 2;
    const radius = 8;
    const updateInterval = 200;

    var stage = new Konva.Stage({
        container: 'container',
        width: window.innerWidth,
        height: window.innerHeight,
    });
    var layer = new Konva.Layer();

    const Dots = [];

    axios.get('/api/display')
        .then(function (response) {
            const data = response.data;
            for(var y=0 ; y<data.height ; y++) {
                Dots[y] = [];
                for(var x=0 ; x<data.width ; x++) {
                    Dots[y][x] = new Konva.Circle({
                        radius: radius,
                        fill: data.content[y][x] === 1 ? 'black' : 'white',
                        stroke: data.content[y][x] === 1 ? 'black' : 'white',
                        strokeWidth: 0
                    });
                    Dots[y][x].absolutePosition({
                        x: (x*(radius + paddingLeft))*2,
                        y: (y*(radius + paddingTop))*2,
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
                                Dots[y][x].fill(data.content[y][x] === 1 ? 'black' : 'white');
                                Dots[y][x].stroke(data.content[y][x] === 1 ? 'black' : 'white');
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