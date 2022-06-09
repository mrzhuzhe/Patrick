vsp = sparse([2 - 1 zeros(1, 6)]) 
% please look at each output
Ksp= toeplitz(vsp) 
% sparse format gives the nonzero positions and entries
bsp = Ksp(:, 2) 
% colon keeps all rows of column 2, so bsp = column 2 of Ksp
usp = Ksp\bsp 
% zeros in Ksp and bsp are not processed, solution: usp(2) = 1
uuu = full(usp) 
% return from sparse format to the full uuu = [0 1 0 0 0 0 0 0]
disp(uuu)