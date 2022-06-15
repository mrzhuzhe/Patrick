A = [4 3;3 -4]
[m, n] = size(A);
U = zeros(m, n);
for k = 1:n
    w = A(k:m,k);
    w(1) = w(1) - norm(w); 
    u = w / norm(w);
    U(k:m,k) = u;
    A(k:m,k:n) = A(k:m,k:n) - 2 *u*(u'*A(k:m,k:n));
end
R = triu(A(:,1:n))
U