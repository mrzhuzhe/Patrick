#g = @(u) u^2 - 1;
#u = fzero(g, 10)
#u = fzero(g, 11) # why not diverge ?

g = @(u) sin(u); 
J = @(u) cos(u); 
u = 1;
for i = 1:10
    u = u - J(u)\g(u);
end
#format long 
[u, g(u)]
