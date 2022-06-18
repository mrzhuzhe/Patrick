function c = w_cuts(a, ind, w)
% compute weighted cut value given similarity matrix, clusteing and weights
nc=max(ind);
c=0;
D = sum(a);
for i=1:nc
    cid = find(ind==i);
    if (sum(w(cid))>0)
        c = c+ (sum(D(cid))-sum(sum(a(cid,cid))))/sum(w(cid));
    end
end