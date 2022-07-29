n = 40; % number of fourier item
c = [.5 2/pi*i.^(0:n-2)./(1:n-1).*mod(1:n-1,2)];  % half of the ck are zero
x = linspace(-pi,pi,1000);
u0 = real(c*exp(i*(0:n-1)'*x));
for t = 0:.01:1;
    clf
    for xderiv = 1:3
        subplot(2, 2, xderiv)
        ct = c.*exp((i*(0:n-1)).^xderiv*t);
        plot(x, u0, 'c:', x, real(ct*exp(i*(0:n-1)'*x)), 'r-');
        axis([-pi pi -.5 1.5]);
        title(sprintf('u_t=u_{%dx}', xderiv))
    end
    drawnow
end