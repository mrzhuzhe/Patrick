clear all
%first run script to generate W, D
gsnc
theta=[1:N]*2*pi/N; 
x=zeros(2*N,1); 
y=x; % Angles in graph display
x(1:2:2*N-1)=cos(theta)-1; 
x(2:2:2*N)=cos(theta)+1;
y(1:2:2*N-1)=sin(theta)-1; 
y(2:2:2*N)=sin(theta)+1;
%initial clustering
ind = [2 1 2 1 1 2 2 1 1 1 2 1 2 2 1 1 2 2 1 2]';
%weighted adjacency matrix for kernel k-means
NW = D^(-1)*W*D^(-1);
%run weighted kernel k-means and plot results
[rind,obj,c] = pingpong_w(NW, ind, 2, 0, 0, ones(20,1), W, x, y);