n = 4
C = toeplitz([2 -1 0 -1]);
K = toeplitz([2 -1 zeros(1, 2)]);
T = K;   # automatic deep clone 
T(1,1) = 1;
U = triu(ones(4));
B = T;
B(n, n) = 1

printf("K\n")
disp(K)

printf("T\n")
disp(T)

printf("B\n")
disp(B)


printf("C\n")
disp(C)


printf("U\n")
disp(U)

eye(8)

ones(7, 1)

E = -diag(ones(7, 1),1)
K2 = 2*eye(8) + E + E'

diag(ones(8,1))

row1 = [2 -1 zeros(1, 6)]
K3 = toeplitz(row1)

det(K)
det(T)
det(B)
det(C)

f = [1 2 3 4]
u = f/K
f = [1 -1 1 -3]
u = pinv(B) * f'
