%1.2  freefixedcode.m
n = 15;
K = toeplitz([2 -1 zeros(1, n-2)]);
T = K;   # automatic deep clone 
T(1,1) = 1;
T

h = 1/8*(n+1) 
u = cos(pi*(1:n)'*h/2) 
c = (pi/2)^2 
f = c*u  % Usual matrix T
disp(h*h*T)
U = h*h*T\f         % Solution u_1,...,u_n with one-sided condition u_0 = u_1
e = 1 - U(1)         % First-order error at x = 0

g = [c/2;f] % Create T_{n+1} as in equation (34) below. Note g(1) = f(0)/2

n = n +1;
K = toeplitz([-2 1 zeros(1, n-2)]);
T = K;   # automatic deep clone 
T(1,1) = -1;
T

V = h*h*T\g;         % Solution u_0,...,u_n with centered condition u_{-1} = u_1
E = 1 - V(1)         % Second-order error from centering at x = 0

## e poportional to h E poportional to h^2