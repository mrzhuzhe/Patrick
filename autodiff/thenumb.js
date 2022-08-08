function Const(n) {
	return {op: 'const', in: [n], out: undefined, grad: 0};
}
function Add(x, y) {
	return {op: 'add', in: [x, y], out: undefined, grad: 0};
}
function Times(x, y) {
	return {op: 'times', in: [x, y], out: undefined, grad: 0};
}
function Divide(x, y) {
	return {op: 'divide', in: [x, y], out: undefined, grad: 0};
}

function f(x) {
    // Edit me!
    return Add(Times(x, x), Add(x, Const(1)));
}

let in_node = {op: 'const', in: [/* TBD */], out: undefined, grad: 0};
let out_node = f(in_node);

console.log(out_node)

function forward(node) {
	if (node.out !== undefined) return;
	if (node.op === 'const') {
		node.out = node.in[0];
	} else if (node.op === 'add') {
		forward(node.in[0]);
		forward(node.in[1]);
		node.out = node.in[0].out + node.in[1].out;
	} else if (node.op === 'times') {
		forward(node.in[0]);
		forward(node.in[1]);
		node.out = node.in[0].out * node.in[1].out;
	} else if(node.op === 'divide') {
		forward(node.in[0]);
		forward(node.in[1]);
		node.out = node.in[0].out / node.in[1].out;
	}

}

function backward(out_node) {
	const order = topological_sort(out_node).reverse();
	for (const node of order) {
		if (node.op === 'add') {
			node.in[0].grad += node.grad;
			node.in[1].grad += node.grad;
		} else if (node.op === 'times') {
			node.in[0].grad += node.in[1].out * node.grad;
			node.in[1].grad += node.in[0].out * node.grad;
		} else if(node.op === 'divide') {
            n.in[0].grad += n.grad / node.in[1].out;
            n.in[1].grad += (-n.grad * node.in[0].out / (node.in[1].out * node.in[1].out));
        }
	}
}

function evaluate(x, in_node, out_node) {
	in_node.in = [x];
	forward(out_node);

	out_node.grad = 1;
	backward(out_node);

	return [out_node.out, in_node.grad];
}

W = H = 256
//   initial a grey image
let guess_image = new Array(W*H*3);
for (let i = 0; i < W * H * 3; i++) {
	guess_image[i] = Const(127);
}

// blurred image
let blurred_guess_image = new Array(W*H*3);

const clamp = (num, a, b) => Math.max(Math.min(num, Math.max(a, b)), Math.min(a, b))

for (let x = 0; x < W; x++) {
	for (let y = 0; y < H; y++) {

		let [r,g,b] = [Const(0), Const(0), Const(0)];

		// Accumulate pixels for averaging
		for (let i = -1; i < 1; i++) {
			for (let j = -1; j < 1; j++) {

				// Convert 2D pixel coordinate to 1D row-major array index
				const xi = clamp(x + i, 0, W - 1);
				const yj = clamp(y + j, 0, H - 1);
				const idx = (yj * W + xi) * 3;

				r = Add(r, guess_image[idx + 0]);
				g = Add(g, guess_image[idx + 1]);
				b = Add(b, guess_image[idx + 2]);
			}
		}

		// Set result to average 
		const idx = (y * W + x) * 3;
		blurred_guess_image[idx + 0] = Divide(r, Const(9));
		blurred_guess_image[idx + 1] = Divide(g, Const(9));
		blurred_guess_image[idx + 2] = Divide(b, Const(9));
	}
}



let loss = Const(0);

for (let x = 0; x < W; x++) {
	for (let y = 0; y < H; y++) {

		const idx = (y * W + x) * 3;
		let dr = Add(blurred_guess_image[idx + 0], Const(-observed_image[idx + 0]));
		let dg = Add(blurred_guess_image[idx + 1], Const(-observed_image[idx + 1]));
		let db = Add(blurred_guess_image[idx + 2], Const(-observed_image[idx + 2]));

		loss = Add(loss, Times(dr, dr));
		loss = Add(loss, Times(dg, dg));
		loss = Add(loss, Times(db, db));
	}
}
console.log("loss", loss)


function gradient_descent_step(step_size) {
	
	// Clear output values and gradients
	reset(loss);

	// Forward pass
	forward(loss);

	// Backward pass
	loss.grad = 1;
	backward(loss);

	// Move parameters along gradient 
	for (let i = 0; i < W * H * 3; i++) {
		let p = guess_image[i];
		p.in[0] -= step_size * p.grad;
	}
}
