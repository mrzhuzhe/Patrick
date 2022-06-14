%2.2  normalmodescode.m
M = [9 0;0 1];
K = [2 -1; -1 2];
#uzero = [9 10; 11 12]
#vzero = [13 14; 15 16]
uzero = [1; 1]
vzero = [1; -1]
t_arr = 1:25;
u_arr1 = []
u_arr2 = []
% inputs M, K, uzero, vzero, t
[vectors,values] = eig(K,M); eigen = diag(values); % solve Kx = (lambda)Mx
A = vectors\uzero; B = (vectors*sqrt(values))\vzero;

for t = t_arr
    coeffs = A.*cos(t*sqrt(eigen)) + B.*sin(t*sqrt(eigen));
    u = vectors*coeffs;  % solution at time t to Mu'' + Ku = 0 
    u_arr1 = [u_arr1, u(1)];
    u_arr2 = [u_arr2, u(2)];
end
u_arr1
#plot(t_arr, u_arr)
plot(u_arr1, u_arr2)