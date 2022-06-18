function [rind, obj, c]= pingpong_w(a, ind, k, l, pad, w, AM, xM, yM)
% usually A is sparse matrix, ind is initial cluster IDs, k is number of
% clusters and pad is a positive number

    
aa = a;
n = length(ind); % # of points
sum_kernel = zeros(k,1); % used for 2nd-order terms in computing kernel distance
sum_w = zeros(k,1); % sum of weights for each cluster
eps = 0.001;    
rind = ind;
drawgraph(AM, xM, yM, rind,0);
if (nargin <= 5) 
    w = ones(n,1);
end
if (nargin <=3)
    l =0;
end
if (nargin >=5) % if a is not positive definite
    aa = pad*diag(w)^-1 + aa;
end

% compute initial obj. function value
t1= w'*diag(aa); % \sum_i w(i)*aa(i,i)
t2=0;
kDist = zeros(n,k);
for i=1:k
    id = find(rind == i); % id contains index of points in cluster i
    sum_w(i) = sum(w(id)); % compute weight sum
    sum_kernel(i) = sum(sum((w(id))*(w(id))'.*aa(id, id))); % compute 2nd-order term
    if (sum_w(i)>0)
        kDist(:,i) = diag(aa)+sum_kernel(i)/sum_w(i)^2-2*aa(:,id)*w(id)/sum_w(i); 
        t2=t2+sum_kernel(i)/sum_w(i);
    end
end
%kDist+diag(aa)

obj(1) = t1-t2;
diff = abs(obj(1)); % in case obj is neg
c(1) = w_cuts(a, rind, w);
fprintf(1,'Initial: obj / cuts/ cuts-obj = %g/ %g/ %g\n', obj(1), c(1), c(1)-obj(1))
%fprintf(1,'\nStarting weighted kernel k-means...\n');

iter =1;
localsearch = 1;

while (localsearch >0)
    
    %batch loop
    while ( (diff > eps*abs(obj(iter))) | (localsearch >0)) 
        old_obj = obj(iter);
        [v, temp_rind]= min(kDist');
        change = sum(rind ~=temp_rind');
        rind = temp_rind';
        t2=0;
        kDist;
        rind';
        for i=1:k
            id = find(rind == i);
            sum_w(i) = sum(w(id));
            sum_kernel(i) = sum(sum((w(id))*(w(id))'.*aa(id, id)));
            if (sum_w(i)>0)
                kDist(:,i) = diag(aa)+sum_kernel(i)/sum_w(i)^2-2*aa(:,id)*w(id)/sum_w(i); 
                t2=t2+sum_kernel(i)/sum_w(i);
            end
        end
        
        obj(iter+1) = t1-t2;
        c(iter+1) = w_cuts(a, rind, w);
        fprintf(1,'Iter %d: obj /cuts / cuts-obj/ moves = %g/ %g/ %g/ %g\n', iter, obj(iter+1), c(iter+1), c(iter+1)-obj(iter+1),change)
        drawgraph(AM, xM, yM, rind,iter);
        %pause
        diff = obj(iter)-obj(iter+1);
        iter = iter +1; 
        localsearch =0;
    end
    %local search
    objchange =0;
    if (l>0)
        [rind, objchange, nmoves] = localSearch(aa, rind, l, k, w, obj(iter));
        obj(iter+1) = obj(iter)+objchange;
        c(iter+1) = w_cuts(a, rind, w);
        fprintf(1,'(LoSe): obj /cuts / cuts-obj/ moves = %g/ %g/ %g/ %g\n', obj(iter+1),c(iter+1), c(iter+1)-obj(iter+1), nmoves)
        iter = iter +1; 
    end
    if (objchange ==0)
        localsearch =0;
    else
        localsearch =1;
        for i=1:k
            id = find(rind == i);
            sum_w(i) = sum(w(id));
            sum_kernel(i) = sum(sum((w(id))*(w(id))'.*aa(id, id)));
            if (sum_w(i)>0)
                kDist(:,i) = sum_kernel(i)/sum_w(i)^2-2*aa(:,id)*w(id)/sum_w(i); 
                t2=t2+sum_kernel(i)/sum_w(i);
            end
        end
    end
    
end
c(2) = w_cuts(a, rind, w);