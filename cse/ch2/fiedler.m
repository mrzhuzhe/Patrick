%2.9  fiedlerplotcode.m
#N = 10;
#W = toeplitz([2 -1 zeros(1, 2)]);
#z = 

N=10; W=zeros(2*N,2*N);          % Generate 2N nodes, two clusters 
rand('state',100);               % Rand repeats to give same graph
for i=1:2*N-1
    for j=i+1:2*N
        p=0.7 - 0.6*mod(j-i,2);  % p=0.1 when j-i is odd, 0.7 else
        W(i,j)=rand < p;         % Insert edges with probability p
    end                          % All weights in W are 1 so G=A'A
end
W=W+W'; D=diag(sum(W));          % Adjacency matrix W and degree D
G=D-W; [V,E]=eig(G,D);           % Eigenvalues of Gx = (lambda) Dx
[a,b]=sort(diag(E));             % Eigenvalues in increasing order
z=V(:,b(2));  

theta=[1:N]*2*pi/N; x=zeros(2*N,1); y=x; % Angles in graph display
x(1:2:2*N-1)=cos(theta)-1; x(2:2:2*N)=cos(theta)+1;
y(1:2:2*N-1)=sin(theta)-1; y(2:2:2*N)=sin(theta)+1;
subplot(2,2,1), gplot(W,[x,y]), title('Graph') % First of four plots
subplot(2,2,2), spy(W), title('Adjacency matrix W')
subplot(2,2,3), plot(z(1:2:2*N-1),'ko'), hold on
plot(z(2:2:2*N),'r*'), hold off, title('Fiedler components')
[c,d]=sort(z); subplot(2,2,4), spy(W(d,d)), title('Reordered Matrix W')