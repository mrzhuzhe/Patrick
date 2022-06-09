# 1
K = toeplitz([2 -1 zeros(1, 3)]);
T = K;   
T(1,1) = 1;
inv(T)

# 2