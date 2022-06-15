% Karan Mistry, #84
% 18.085 - Truss Calculations
% October 2008

clear all; close all; clc;

%% Truss Input
% NOTE: the vectors 'truss' and 'bars' can be defined either in an external
% script or in this section.
% 
% nodes = [x-position, y-position, ground(1 or 0), Fh, Fv; ... ];
% bars = [node_i, node_j, C; ... ]; % C = EA/L
% 
% Example of input:

nodes = [
    0 0 1 0 0                       % Node 1 (x=0,y=0,ground=1,Fh=0,Fv=0)
    cos(2*pi/3) sin(2*pi/3) 0 0 1   % Node 2
    0 2*sin(2*pi/3) 0 2 0           % Node 3
    1 2*sin(2*pi/3) 0 0 1           % Node 4
    1+cos(pi/3) sin(pi/3) 0 3 2     % Node 5
    1 0 1 0 0                       % Node 6
];

bars = [
    1,2,1                           % Bar going from Node 1 to Node 2, C = 1
    2,3,1                           % etc.
    3,4,1
    4,5,1
    5,6,1
    3,5,3
    1,3,2
    3,6,4
];

#bars = [];

%% Properties of Truss
N = size(nodes,1);      % Number of nodes (rows of nodes)
m = size(bars,1);       % Number of bars (rows of bars)
mo = (N-1)*N/2;         % Number of possible bars based on number of nodes, nchoosek(N,2)

% Determine bar number for each input. If the first node is I and the
% second node is J, then the bar number is (J-I) + ncoosek(I,2) since
% nchoosek(I,2) is the number of possible bars with I nodes, and the
% current bar is the (J-I)st bar after the first set.
% 
% foo   - contains the bar numbers of the present bars
% bars2 - a vector of all possible bars. 1 for bar, 0 for no bar
foo1 = bars(:,2)-bars(:,1)+(bars(:,1)-1).*(N-bars(:,1)/2);
bars2 = zeros(mo,1);    % initialize bars2 (0 = no bar)
bars2(foo1) = 1;        % Set actual bars to 1 (1 = bar)

%% Compute Ao - Assume all bars are present
A = zeros(mo,2*N);  % A has a row for each bar and two columns for each node
k = 1;              % Counter for bar number
for i=1:N           % Each bar can go from node i to j where j does not equal i
    for j=i+1:N     % Only considering i to j, where j>i, so as to not double count
        theta = atan2(nodes(j,2)-nodes(i,2),nodes(j,1)-nodes(i,1));
        A(k,2*i-1) = -cos(theta);   % x coordinate of first node
        A(k,2*i)   = -sin(theta);   % y coordinate of first node
        A(k,2*j-1) =  cos(theta);   % x coordinate of second node
        A(k,2*j)   =  sin(theta);   % y coordinate of second node
        
        k=k+1;                      % increment bar number
    end
end

%% Remove Rows for nonexistant bars and Columns for grounded nodes
% Remove columns of A for grounded nodes.
% Note that need to remove two columns for each grounded node
groundnode = find(nodes(:,3)==1);
filter_ground = [2*groundnode-1; 2*groundnode];
A(:,filter_ground)=[];

% Remove rows of A for each bar that does not exist
filter_nobar = find(bars2==0);
A(filter_nobar,:)=[];

%% Compute C and K
foo2 = sortrows([foo1 bars(:,3)]);  % Sort bar constants based on bar number
C = diag(foo2(:,2));                % C is a diagonal matrix

K = A'*C*A;                         % Stiffness Matrix

%% Compute F
F(2*(1:N)-1,1) = nodes(:,4);        % Horizontal force in odd positions
F(2*(1:N),1)   = nodes(:,5);        % Vertical forces in even positions
F(filter_ground)=[];                % Remove forces on ground nodes

%% Calculate u, e, and w for Statically Determinate Truss
if abs(det(K)) >= 1e-6              % Determinant must not be zero
    u = K\F;                        % Displacements
    e = A*u;                        % Elongations
    w = C*e;                        % Internal Forces
end

%% Plot Truss
figure
axis([min(nodes(:,1))-1 max(nodes(:,1))+1 min(nodes(:,2))-1 max(nodes(:,2))+1]);
axis equal;
title('\bf{Truss}');
hold on;

% Plot all nodes as circles
plot(nodes(:,1),nodes(:,2),'ko');
% Plot grounded nodes as black dots
plot(nodes(groundnode,1),nodes(groundnode,2),'k.','MarkerSize',18);
% Plot bars
for i = 1:m
    x = [nodes(bars(i,1),1) nodes(bars(i,2),1)];
    y = [nodes(bars(i,1),2) nodes(bars(i,2),2)];
    plot(x,y,'k-');
end
hold off;

%% Output
A                   % Adacency Matrix
C                   % Bar Constant Matrix
K                   % Stiffness Matrix
F                   % Force Vector
rankA = rank(A)
nullA = null(A)     % Truss Mechanisms 

if abs(det(K)) >= 1e-6
    u               % Displacements
    e               % Elongations
    w               % Internal Forces
else
    disp('Det(K) is zero (or very small). Truss is not statically determinant.');
    disp('--> u, e, and w can not be found. Add more restraints and try again.');
    disp(' ');
end

%%%%%%%%%%%%%%%%%%%%%%%% End of truss_calculation.m %%%%%%%%%%%%%%%%%%%%%%%