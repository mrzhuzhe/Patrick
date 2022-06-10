%%  Finite differences for the advection-diffusion equation
% 
%      - D u_xx   + v u_x   =   1 
% 
%     on the domain x=[0,1],
%     with boundary conditions u(0)=u(1)=0.
%
%     Computational Science and Engineering
%     Chapter 1, Section 1.2, p 25, Question 19.
%


% This is a code for Problem 1.2.19: Finite differences for the linear advection-diffusion equation
% - D * u_xx + v * u_x = 1 in Homework 1 [1.2.19]
% You could test this code with different parameters D, v, h as suggested below.
% The code solves and then plots the solutions. It compares the true analytic solution with the solution from finite differences, using (1) centered differences and (2) upwind differences. See sample outputs. It is easy to
% * see the matrices K (diffusion) and Del0 or Del_+ (centered/forward) for small N
% * see the boundary conditions u(0) = 0 and u(1) = 0
% * see whether centered or upwind is more accurate
% * make h smaller and see the approximations converge (increase the number of mesh points, N, to make h smaller)
% * try different values of the parameters D, v
% (i) v=D=1
% (ii) v << D (and see the numerical approximation is good, even with large h)
% (iii) v >> D (and see a boundary layer because diffusion is so weak)

clear
clc
close all

% try experimenting with parameters D, v, and N.
% D=1; v=1; 
% D=0.05; v=0.2;
D=0.05; v=2; % boundary layer
N=5+1; % mesh points 

xL=0; xR=1; h=(xR-xL)/(N-1);    % h is the spatial discretization size
x=xL:h:xR; x=x';

% True solution:
r=v/D;
C=1/(v*(exp(r)-1));
uTrue=x/v+C*(1-exp(r*x));

% diffusion matrix
e = ones(N,1); 
K = spdiags([e -2*e e], -1:1, N, N); 
K=D*K/h^2; 
K=full(K)  % uncomment this line to see the matrix K (it will be easier if N is small)

% centered difference matrix
Del0 = spdiags([-e e], [-1 1], N, N)
Del0=v*Del0/(2*h);
Del0=full(Del0)

% upwind difference matrix
DelPlus = spdiags([-e e], 0:1, N, N); 
DelPlus=v*DelPlus/h;
DelPlus=full(DelPlus)

%% Linear solve
A=Del0-K; % centered advection matrix, plus diffusion matrix
A(1,:)=0; A(end,:)=0; A(1,1)=1; A(end,end)=1; % boundary conditions
b=ones(size(x));  b(1)=0; b(end)=0;           % boundary conditions
u=A\b;    % solve with backslash (centered) 

A=DelPlus-K; % upwind advection matrix, plus diffusion matrix
A(1,:)=0; A(end,:)=0; A(1,1)=1; A(end,end)=1; % boundary conditions
U=A\b;    % solve with backslash (upwind)

%% plot results
FS='FontSize';
figure(1)
plot(x,u, x,U, '--', x, uTrue, '+', 'LineWidth', 2)
title({'- D u_{xx}   + v u_x   =   1 ',  ['   D=', num2str(D), '   v=', num2str(v), '         h=', num2str(h)]}, FS, 16)
legend('u   centered', 'U   upwind', 'true solution')
xlabel('x', FS, 16)
ylabel('u', FS, 16)

disp('Finished.')