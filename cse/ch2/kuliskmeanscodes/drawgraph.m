function drawgraph(AM, xM, yM, rind,it)
s=sprintf('Iteration %d',it);
subplot(2,4,it+1), gplot(AM,[xM,yM]), title(s);
hold on
for i = 1:length(xM)
    if rind(i) == 1
        plot(xM(i),yM(i),'g.','MarkerSize',30);
    else
        plot(xM(i),yM(i),'r.','MarkerSize',30);
    end
end
hold off