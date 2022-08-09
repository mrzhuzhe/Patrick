
// lol (again)

import { CodeJar } from '../js/codejar.js';

const highlight = editor => {
    const text = editor.textContent;
    editor.innerHTML = Prism.highlight(
        text,
        Prism.languages.javascript,
        "javascript"
    );
};

const blue = "#6C8EBF";
const red = "#B85450";
const green = "#82B366";
const purple = "#A680B8";
// const green = "#690";
// const red = "#dd4a68";
// const blue = "#07A";

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

const draw_axes = function (canvas) {
    let ctx = canvas.getContext("2d");
    let w = canvas.width;
    let h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.beginPath();
    ctx.strokeStyle = green;
    ctx.moveTo(0.1 * w, 0.1 * h);
    ctx.lineTo(0.1 * w, 0.9 * h);
    ctx.stroke();
    ctx.beginPath();
    ctx.strokeStyle = red;
    ctx.moveTo(0.1 * w, 0.5 * h);
    ctx.lineTo(0.9 * w, 0.5 * h);
    ctx.stroke();
}

const draw_graph = function (canvas, f, xs, ys, color) {
    let ctx = canvas.getContext("2d");
    let w = canvas.width;
    let h = canvas.height;
    const div = 2;
    const yscale = (0.8 * h) / ys;
    const xscale = (0.8 * w) / xs;
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.moveTo(0.1 * w, 0.5 * h - f(0) * yscale);
    for (let x = 0; x < (w * 0.8) / div; x++) {
        let y = f(x * div / xscale) * yscale;
        ctx.lineTo(0.1 * w + x * div, 0.5 * h - y);
    }
    ctx.stroke();
}

const draw_error = function (canvas, message) {
    let ctx = canvas.getContext("2d");
    let w = canvas.width;
    let h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.font = '16px sans-serif';
    ctx.fillText('Error: ' + message, 10, 26);
}

{ // numerical diff 
    highlight(document.getElementById('numerical-example'));

    const editor = document.getElementById('numerical-editor');
    const jar = CodeJar(editor, highlight, { tab: '\t' });
    const button = document.getElementById('numerical-button');

    const canvas = document.getElementById('numerical-canvas');
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    jar.updateCode(`function f(x) {
    // Edit me!
    if(x < Math.PI / 2) return x;
    return x * Math.sin(x);
}`);

    const numerical_diff = function (f, h) {
        return function (x) {
            return (f(x + h) - f(x)) / h;
        }
    }

    let update = function (code) {
        try {
            const f = Function("_x", 'return ' + code + '(_x);');
            const df = numerical_diff(f, 0.001);
            draw_axes(canvas);
            draw_graph(canvas, f, 5, 10, blue);
            draw_graph(canvas, df, 5, 10, purple);
        } catch (e) {
            draw_error(canvas, e.message);
        }
    }

    window.onresize = function () {
        update(jar.toString());
    };
    button.onclick = function () {
        update(jar.toString());
    };
    update(jar.toString());
}

{ // symbolic diff

    const editor = document.getElementById('symbolic-editor');
    const jar = CodeJar(editor, highlight, { tab: '\t' });
    const button = document.getElementById('symbolic-button');

    const output = document.getElementById('symbolic-output');

    const canvas = document.getElementById('symbolic-canvas');
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    jar.updateCode(`function f(x) {
    // Edit me!
    return Add(Times(x, x), Add(x, x));
}`);

    const add = function (a, b) {
        return ['add', a, b];
    }
    const times = function (a, b) {
        return ['times', a, b];
    }
    const diff = function (ast) {
        if (typeof ast === 'number') {
            return 0;
        } else if (ast === 'x') {
            return 1;
        } else if (ast[0] === 'add') {
            return add(diff(ast[1]), diff(ast[2]));
        } else if (ast[0] === 'times') {
            return add(times(ast[1], diff(ast[2])), times(diff(ast[1]), ast[2]));
        } else {
            throw new Error('Unknown: ' + ast);
        }
    }
    const print = function (ast) {
        if (typeof ast === 'number') {
            return ast;
        } else if (ast === 'x') {
            return 'x';
        } else if (ast[0] === 'add') {
            return 'Add(' + print(ast[1]) + ', ' + print(ast[2]) + ')';
        } else if (ast[0] === 'times') {
            return 'Times(' + print(ast[1]) + ', ' + print(ast[2]) + ')';
        } else {
            throw new Error('Unknown: ' + ast);
        }
    }
    const eval_ = function (ast, x) {
        if (typeof ast === 'number') {
            return ast;
        } else if (ast === 'x') {
            return x;
        } else if (ast[0] === 'add') {
            return eval_(ast[1], x) + eval_(ast[2], x);
        } else if (ast[0] === 'times') {
            return eval_(ast[1], x) * eval_(ast[2], x);
        } else {
            throw new Error('Unknown: ' + ast);
        }
    }

    let update = function (code) {
        try {
            let f = Function("Add", "Times", 'return ' + code + '(\'x\');');
            const ast_f = f(add, times);
            const ast_df = diff(ast_f);

            output.innerHTML = 'function df(x) {\n\treturn ' + print(ast_df) + ";\n}";
            highlight(output);

            draw_axes(canvas);
            draw_graph(canvas, function (x) {
                return eval_(ast_f, x);
            }, 3, 20, blue);
            draw_graph(canvas, function (x) {
                return eval_(ast_df, x);
            }, 3, 20, purple);

        } catch (e) {
            output.innerHTML = "Error: " + e.message;
            draw_error(canvas, e.message);
        }
    }

    button.onclick = function () {
        update(jar.toString());
    };
    update(jar.toString());
}

{ // forward mode autodiff
    highlight(document.getElementById('forward-lib'));

    const editor = document.getElementById('forward-editor');
    const jar = CodeJar(editor, highlight, { tab: '\t' });
    const button = document.getElementById('forward-button');

    const canvas = document.getElementById('forward-canvas');
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    jar.updateCode(`function f(x) {
    // Edit me!
    return Add(Times(x, x), Add(x, Const(1)));
}`);

    const const_ = function(n) {
        return [n, 0];
    }
    const add = function (a, b) {
        return [a[0] + b[0], a[1] + b[1]];
    }
    const times = function (a, b) {
        return [a[0] * b[0], a[1] * b[0] + a[0] * b[1]];
    }

    let update = function (code) {
        try {
            let _f = Function("Add", "Times", "Const", 'return ' + code + ';');
            const f = _f(add, times, const_);

            draw_axes(canvas);
            draw_graph(canvas, function (x) {
                return f([x, 1])[0];
            }, 3, 20, blue);
            draw_graph(canvas, function (x) {
                return f([x, 1])[1];
            }, 3, 20, purple);

        } catch (e) {
            draw_error(canvas, e.message);
        }
    }

    button.onclick = function () {
        update(jar.toString());
    };
    update(jar.toString());
}

{ // backward mode autodiff
    highlight(document.getElementById('backward-lib'));
    highlight(document.getElementById('backward-lib-2'));
    highlight(document.getElementById('backward-lib-3'));
    highlight(document.getElementById('backward-lib-4'));
    highlight(document.getElementById('backward-lib-5'));

    const editor = document.getElementById('backward-editor');
    const jar = CodeJar(editor, highlight, { tab: '\t' });
    const button = document.getElementById('backward-button');

    const canvas = document.getElementById('backward-canvas');
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    jar.updateCode(`function f(x) {
    // Edit me!
    return Add(Times(x, x), Add(x, Const(1)));
}`);

    const const_ = function(n) {
        return {name : 'const', out: undefined, grad : 0, in : [n]};
    }
    const add = function (a, b) {
        return {name : 'add', out: undefined, grad : 0, in : [a,b]};
    }
    const times = function (a, b) {
        return {name : 'times', out: undefined, grad : 0, in : [a,b]};
    }
    const divide = function (a, b) {
        return {name : 'divide', out: undefined, grad : 0, in : [a,b]};
    }

    const reset = function (n) {
        n.out = undefined;
        n.grad = 0;
        if(n.name !== 'const') n.in.map(reset);
    }
    const forward = function (n) {
        if (n.out !== undefined) {
            return;
        }
        if (n.name === 'const') {
            n.out = n.in[0];
        } else if (n.name === 'add') {
            forward(n.in[0]);
            forward(n.in[1]);
            n.out = n.in[0].out + n.in[1].out;
        } else if (n.name === 'times') {
            forward(n.in[0]);
            forward(n.in[1]);
            n.out = n.in[0].out * n.in[1].out;
        } else if (n.name === 'divide') {
            forward(n.in[0]);
            forward(n.in[1]);
            n.out = n.in[0].out / n.in[1].out;
        } else {
            throw new Error('Unknown node: ' + n);
        }
    }
    const topological_sort = function (n) {
        let order = [];
        let visited = new Set();
        let visit = function (n) {
            if (!visited.has(n)) {
                visited.add(n);
                if(n.name !== 'const') {
                    n.in.map(visit);
                    order.push(n);
                }
            }
        }
        visit(n);
        return order;
    }
    const backward = function (graph) {
        let order = topological_sort(graph).reverse();
        for (const n of order) {
            if (n.name === 'add') {
                n.in[0].grad += n.grad;
                n.in[1].grad += n.grad;
            } else if (n.name === 'times') {
                n.in[0].grad += n.in[1].out * n.grad;
                n.in[1].grad += n.in[0].out * n.grad;
            } else if (n.name === 'divide') {
                n.in[0].grad += n.grad / n.in[1].out;
                n.in[1].grad += -n.grad * n.in[0].out / (n.in[1].out * n.in[1].out);
            } else if(n.name !== 'const') {
                throw new Error('Unknown node: ' + n);
            }
        }
    }

    let update = function (code) {
        try {
            let _f = Function("Add", "Times", "Const", 'return ' + code + ';');
            
            const f = _f(add, times, const_);

            var in_node = {name : 'const', out : undefined, grad : 0, in : []};
            const out_node = f(in_node);

            draw_axes(canvas);
            draw_graph(canvas, function (x) {
                reset(out_node);
                
                in_node.in = [x]; 
                forward(out_node);
                return out_node.out;

            }, 3, 20, blue);
            draw_graph(canvas, function (x) {
                reset(out_node);
                
                in_node.in = [x];
                forward(out_node);
                out_node.grad = 1;
                backward(out_node);
                return in_node.grad;

            }, 3, 20, purple);

        } catch (e) {
            draw_error(canvas, e.message);
        }
    }

    button.onclick = function () {
        update(jar.toString());
    };
    update(jar.toString());

    { // image reconstruction
        highlight(document.getElementById('image-div'));
        highlight(document.getElementById('image-impl-0'));
        highlight(document.getElementById('image-impl-1'));
        highlight(document.getElementById('image-impl-2'));
        highlight(document.getElementById('image-impl-3'));

        let step_size_slider = document.getElementById('image-step-size');
        let loss_text = document.getElementById('image-loss');
        let error_text = document.getElementById('image-error');
        let step_button = document.getElementById('image-step');
        let reset_button = document.getElementById('image-reset');
        const get_data = document.createElement('canvas').getContext('2d');
        const orig = document.getElementById('image-orig');
        const blur = document.getElementById('image-blur');
        const cur = document.getElementById('image-cur');
        const cur_blur = document.getElementById('image-cur-blur');
        const grad = document.getElementById('image-grad');
        const N = 256;
        orig.width = N;
        orig.height = N;
        blur.width = N;
        blur.height = N;
        cur.width = N;
        cur.height = N;
        cur_blur.width = N;
        cur_blur.height = N;
        grad.width = N;
        grad.height = N;
        const orig_ctx = orig.getContext('2d');
        const blur_ctx = blur.getContext('2d');
        const cur_ctx = cur.getContext('2d');
        const cur_blur_ctx = cur_blur.getContext('2d');
        const grad_ctx = grad.getContext('2d');
        
        const pixel = function (data,x,y) {
            const i = (y*spot.width + x)*4;
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            return [r,g,b];
        }

        const spot = new Image();
        spot.onload = () => {
            const M = spot.width;
            const scale = N / M;

            const blur_img = function (data_in, data_out) {
                for (var x = 0; x < M; x++) {
                    for (var y = 0; y < M; y++) {
                        let [br,bg,bb] = [0,0,0];
                        for (var i = -1; i <= 1; i++) {
                            for (var j = -1; j <= 1; j++) {
                                const xi = clamp(x + i, 0, M - 1);
                                const yi = clamp(y + j, 0, M - 1);
                                const [r,g,b] = pixel(data_in,xi,yi);
                                br += r;
                                bg += g;
                                bb += b;
                            }
                        }
                        const idx = (y*M + x)*4;
                        data_out[idx] = br/9;
                        data_out[idx + 1] = bg/9;
                        data_out[idx + 2] = bb/9;
                        data_out[idx + 3] = 255;
                    }
                }
            };
    
            const blur_img_grad = function (vals_in) {
                let vals_out = new Array(vals_in.length);
                for (var x = 0; x < M; x++) {
                    for (var y = 0; y < M; y++) {
                        
                        const idx = function (i,j) {
                            const xi = clamp(x + i, 0, M - 1);
                            const yi = clamp(y + j, 0, M - 1);
                            return (yi*M + xi)*3;
                        };
                        let i0 = idx(-1,-1);
                        let r0 = vals_in[i0];
                        let g0 = vals_in[i0+1];
                        let b0 = vals_in[i0+2];
                        
                        let i1 = idx(-1,0);
                        let r1 = vals_in[i1];
                        let g1 = vals_in[i1+1];
                        let b1 = vals_in[i1+2];
    
                        let i2 = idx(-1,1);
                        let r2 = vals_in[i2];
                        let g2 = vals_in[i2+1];
                        let b2 = vals_in[i2+2];
    
                        let i3 = idx(0,-1);
                        let r3 = vals_in[i3];
                        let g3 = vals_in[i3+1];
                        let b3 = vals_in[i3+2];
                        
                        let i4 = idx(0,0);
                        let r4 = vals_in[i4];
                        let g4 = vals_in[i4+1];
                        let b4 = vals_in[i4+2];
    
                        let i5 = idx(0,1);
                        let r5 = vals_in[i5];
                        let g5 = vals_in[i5+1];
                        let b5 = vals_in[i5+2];
    
                        let i6 = idx(1,-1);
                        let r6 = vals_in[i6];
                        let g6 = vals_in[i6+1];
                        let b6 = vals_in[i6+2];
                        
                        let i7 = idx(1,0);
                        let r7 = vals_in[i7];
                        let g7 = vals_in[i7+1];
                        let b7 = vals_in[i7+2];
    
                        let i8 = idx(1,1);
                        let r8 = vals_in[i8];
                        let g8 = vals_in[i8+1];
                        let b8 = vals_in[i8+2];
    
                        let r = divide(add(add(add(add(r0, r1), add(r2, r3)), add(add(r4, r5), add(r6, r7))), r8), const_(9));
                        let g = divide(add(add(add(add(g0, g1), add(g2, g3)), add(add(g4, g5), add(g6, g7))), g8), const_(9));
                        let b = divide(add(add(add(add(b0, b1), add(b2, b3)), add(add(b4, b5), add(b6, b7))), b8), const_(9));
    
                        const idx_out = (y*M + x)*3;
                        vals_out[idx_out] = r;
                        vals_out[idx_out + 1] = g;
                        vals_out[idx_out + 2] = b;
                    }
                }
                return vals_out;
            };    

            const draw_img = function (ctx, data) {
                for (var x = 0; x < M; x++) {
                    for (var y = 0; y < M; y++) {
                        const [r,g,b] = pixel(data,x,y);
                        ctx.fillStyle = "rgba("+r+","+g+","+b+",255)";
                        ctx.fillRect(x * scale, y * scale, scale, scale);
                    }
                }
            }

            get_data.drawImage(spot,0,0);

            const target_data = get_data.getImageData(0,0,M,M).data;
            const blur_data = new Array(target_data.length);
            const cur_data = new Array(target_data.length);
            const cur_data_blur = new Array(target_data.length);
            const grad_data = new Array(target_data.length);
            
            blur_img(target_data, blur_data);

            let parameters = new Array(M*M*3);
            for (var x = 0; x < M; x++) {
                for (var y = 0; y < M; y++) {
                    const idx = (y*M + x)*3;
                    parameters[idx] = const_(255/2);
                    parameters[idx + 1] = const_(255/2);
                    parameters[idx + 2] = const_(255/2);
                }
            }
            let outputs = blur_img_grad(parameters);

            let loss = const_(0);
            for (var x = 0; x < M; x++) {
                for (var y = 0; y < M; y++) {
                    const out_idx = (y*M + x)*3;
                    const compare_idx = (y*M + x)*4;
                    let d0 = add(outputs[out_idx], const_(-blur_data[compare_idx]));
                    let d1 = add(outputs[out_idx + 1], const_(-blur_data[compare_idx + 1]));
                    let d2 = add(outputs[out_idx + 2], const_(-blur_data[compare_idx + 2]));
                    loss = add(add(loss, times(d0,d0)), add(times(d1,d1), times(d2,d2)));
                }
            }

            let tau = 0.25;
            step_size_slider.oninput = function () {
                tau = step_size_slider.value / 100;
            }

            const run_iteration = function() {

                let error = 0;

                for (var x = 0; x < M; x++) {
                    for (var y = 0; y < M; y++) {
                        const idx = (y*M + x)*3;
                        parameters[idx].in[0] += -tau * parameters[idx].grad;
                        parameters[idx + 1].in[0] += -tau * parameters[idx + 1].grad;
                        parameters[idx + 2].in[0] += -tau * parameters[idx + 2].grad;

                        const e_idx = (y*M + x)*4;
                        let d0 = parameters[idx].in[0] - target_data[e_idx];
                        let d1 = parameters[idx + 1].in[0] - target_data[e_idx + 1];
                        let d2 = parameters[idx + 2].in[0] - target_data[e_idx + 2];
                        error += d0*d0 + d1*d1 + d2*d2;
                    }
                }

                reset(loss);
                forward(loss);
                loss.grad = 1;
                backward(loss);

                loss_text.innerHTML = "<strong>Blurred Guess</strong> (Loss: " + loss.out.toFixed(0) + ")";  
                error_text.innerHTML = "<strong>Guess</strong> (Error: " + error.toFixed(0) + ")";

                for (var x = 0; x < M; x++) {
                    for (var y = 0; y < M; y++) {
                        const i_idx = (y*M + x)*3;
                        const o_idx = (y*M + x)*4;
                        grad_data[o_idx] = Math.log2(Math.abs(parameters[i_idx].grad)) * 25;
                        grad_data[o_idx + 1] = Math.log2(Math.abs(parameters[i_idx + 1].grad)) * 25;
                        grad_data[o_idx + 2] = Math.log2(Math.abs(parameters[i_idx + 2].grad)) * 25;
                        grad_data[o_idx + 3] = 255;
                        cur_data[o_idx] = parameters[i_idx].out;
                        cur_data[o_idx + 1] = parameters[i_idx + 1].out;
                        cur_data[o_idx + 2] = parameters[i_idx + 2].out;
                        cur_data[o_idx + 3] = 255;
                        cur_data_blur[o_idx] = outputs[i_idx].out;
                        cur_data_blur[o_idx + 1] = outputs[i_idx + 1].out;
                        cur_data_blur[o_idx + 2] = outputs[i_idx + 2].out;
                        cur_data_blur[o_idx + 3] = 255;
                    }
                }
            };

            run_iteration();
            
            draw_img(orig_ctx, target_data);
            draw_img(blur_ctx, blur_data);
            draw_img(cur_ctx, cur_data);
            draw_img(cur_blur_ctx, cur_data_blur);
            draw_img(grad_ctx, grad_data);
            
            step_button.onclick = () => { 
                for(let i = 0; i < 5; i++) {
                    run_iteration();
                }
                draw_img(cur_ctx, cur_data);
                draw_img(cur_blur_ctx, cur_data_blur);
                draw_img(grad_ctx, grad_data);
            };
            reset_button.onclick = () => { 
                for(let i = 0; i < M*M*3; i++) {
                    parameters[i].in[0] = 255/2;
                }
                reset(loss);
                run_iteration();
                draw_img(cur_ctx, cur_data);
                draw_img(cur_blur_ctx, cur_data_blur);
                draw_img(grad_ctx, grad_data);
            };
        };
        spot.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAmMSURBVFhHZVdZjBTXFT3VVb3PvtAzrDYgGA8YEyUOBDuWIyurI2MrC/JPpCj5CSJSrCT+tBIlUvyVnyhK4lheCDHYKJItiyDZSuSAIQEbGBZjGDAwDbP0zPT03l29VFXOvVUFcXgzb+pV1at37z333PPeGBcuZj3AgN841LE8isCMpxHhbceuwfPknfSgRaKwojF0mg2+c4OHfjPC5W63ux5ok6cRfxi2YKIY9zqYeeuXOP7yc/B4b+iqwXszhmjpBibf+i3EtLyT12G/u4XOf7rLT+DApx+KA83iLPKFRdiVPD58+yWikYDrunD52qKRueN7MTFxErlrH8G0orqK38SD0ItwHN77TcEMWuAAIwgn8qXndJAYGUO748Bwm2jms0jHTAwO9KG3tx/ezRO4fHMehaqNoZVr+QFxuI2QH4jfGA6t+Z13Qfff+M04/1HWC2GTlz3dKbiOC4ehjgwmke7t1nfNcgPNVhsN2yE6t3Do9Rdw4+plfP9Xr6HdEh54al4ciQhx1Fhoxm+he3cGgQMycDk5M9iFzFAX2nYb0a40PLuOZrOlDkVMC+12B47jYWGpwl7mVxEkrAhGl2eQTCbUsM35S8UKHAVXlv60E//fIiFxZJAv2Tj1wQk1/uIffo+mbaPVaiIatXD+wjlOJzJOi0s7qFdKMNHC+rXDGOgxETUamJ+dwtkzJ3D65HuYvHgalmXxGwn37ibgSNcy1AHnCeyjy/qRy17EKwf+hu/t+jY2rF+Hk6dOY/czP8P+V17GipERFMt1XP3kJjrkimV2cHM6i1K5glKpzEA8JOJJfO2Jp+l4TIkrLURd7Ki94GFEbqSFHg0PpvDiq3tx8I3XsWn8PsS4yK9/8zwe2rEDH1+6pHMdGhbj1VoFc7l5XLo8iUuTV9FxI1i38TN4atcPbxv3S5SW5DcwLk0uMr5dhgKDKzUWMfH+8f9gbMN6mGaEeY3QmIsX/vRHbNk0jma7TTI2Odch+V2WYAzjY5uw6ztPY/ePf44HP/8QudLkemI8sPI/PLijGSSr9Dsl4qG3Jwm06vjJnj04uH8/yuUq2oz0gfs34wvbt2Pjhg3kRBsdlqe0iGnCjFiIxZKolGto2Q3ljCNVxC4IcHWde6eF937QxrkLU/qkxUXH7h1GrF3moibZ3CSkpB3H3X0Damg+l1OW55dKmJtbZEmKsTa7g2gsji899hVFqK8vBaftoVFvwqZDNTrmEV1xKmyKjlzFAYE+GieUXUsEwCYZ6bkicyc1LuXXsVJoIMZqIeMXlmigTrhbRKSDDMn55qF3kKOTqXQaT+18Av39Q3BaLfT39eP6rSmMj48RIZa1pDpoygGJdG2vwGrCY8SeYSoXDNa+YUZhklAGc240CjAKWXjFaRitKhWbc5VdlOdoHKVCjsMWU1HBX/a9iuzUFAYGM1hYXECCAew/8AbTFfOFShv3AslTlA+98jRe+91zJJzDiNoUH0eJJk2iFJ9dj8s77LIDVvPwClNwm1XEWHb5xTns2PYgU9RQeGOU7vf+9S4qlaUAehef27IVR48cZYVExWc2klCvXH6xVEFicCXm6e1iYYkwF1CqVFCp1XDwz8/jH2/uRZvQ1Rt12Mx9h46Ls051AdGIh3JpCaOZEez8xjdZJTaXNqgLBdS4hudJUB29rhwZ1eoKyWn+aPczv1C2xvuo6TZyc3Os7xpq9Qaq1RodqCPePYhE7xDstkMCFulEQ8nVILlgsQJ4TaXSFKAEyjR47fp1XwUZZq1axfp162mcVUEnbs5ksWrlKt1VJXBj4vx1dUZyKR/NT12kEl6h5wWYXMCgslnkguwVwnZetEtEYjzWO8B9IIVUsgvXprI4cuwYurt7NDpZU4JLJdN49JFHESf0h949jGd/+iwcjyiIVpw9f4NEF3fEDwJHYkW5vzudJspLC4ygiAZ7rVIkyfIsr5YcF5BM9yDGHuFNnBwQBF7a91d1xqB4aVDsIjiJRBJ9/QN48vHHcWriDJ7c+S0UKN3S6AAREPO+D+qG7xBfciEZDg72Y6TbRpE8OXrshKYhEY+royK5cjSbyy3gn0ePMtqULKNryC7qMspEIoXlK1bi61/+qlZAOt2FCMVL5lANhY++PFIX5dNAJGQBRysgGulgieJTKhW5V/BQ0t2l5WQRUlVDkkrmtylCMr9JEROyWtxFxzZsxAObN2Pr5i2aQqmIqRvXiRorT1JwLkiBEkGW4UXvhTRkiojSymVplPLTHINsL6BQKFPxOnSUWkFvJXVxKuEsRWh+Ic9nEWSWZTCSyeh5QlaO84DbQ0UtFZeYygV8dvsX0ZJ0nj1/TW375tnE8G0nPJLNxciAhcVcFoViFQlCPDc7o5F0eDiRn0jAmzhznYgl1DFx0OZ5QgKwrDgSqR7yaA4VophK92J86zZFSrdj37j8ZffxDxCQzYRhcyy5lms2myU3eDqiY6JwhQLLsl6jQ3Ja8lMgcitVIvmPRpPUlnl8+O+/o1ycp+hFeWIq4ePLWVy9RkWdOPdJYF+BCIa+cY2Sm9ToQAyNGoWJu+P8fJ6Ey6HGs8DIitW6Yw70sAxTCXIhrs65LtWSCMjOaVhpHDi4D4bX4IF2QJ1ac+8WDA2v1q2etPMjD41LlAq/KgW73OtzcpRQW4RaWNyhAUnHfZvuR2bFKiwbHmT9ixiRmOSkUpto5vNzWD46rAg2eXhNpfq4Rgp2g9s3kZITlJJNovbkkEHjSiu+kKtoeKPZUaZHKVRxst+0TNZxVavCdRpkfI2n6S50pZPKbolM1+PXQsJkshtr7hnH6jVbMJy5R9d2XabIJUITZ68IDYKoZdPQO/+ei0jpiAq+f+QdilKN+0OdEl1hNRTx8MOP6DfTszns+cF3KeE2U2OjUKqRFzbT52HyxgyfVXW3lH9gTNldtVvajTN0gJY0N9rEsPwIASUK7axx7hOHD7/Ng0gu4AclmlIsLJfNadu2zVg9OoLurh4iU8Ot2VksFLhTxlJqKML/JdUgORKepEwiapyZmFSTajgwLuMQBdmSpTvcouG1MHnlihJRVE7PdVxMmD9EgZqemSE6TAk3Mvl2aNkarmIyLQk6S+FSBMQZMxAw6ogiwDwL6XzY/fzrmNGpA4KC8IPzlDTinKDAPDqsEjk/NMiDQqGAkx9MKPyJ1ADrvZ+kE9WkbFM1Q9jFcNgVAVlQaCtOaO3TuI+ArwG+YyJQ4ojPk/Cef4LndJw6L6iIYLVaMsf/X0NWk6OHkFNUUvYYufdg4L/b+entY3vU0AAAAABJRU5ErkJggg=="
    }
}