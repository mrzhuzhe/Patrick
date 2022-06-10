%% 1D Steady Convection Diffusion Equation by Central Difference Scheme
clear;
clc;
%% User Input
phi1=input('Please input the first boundary condition');
phi2=input('Please input the second boundary condition');
L=input('What''s the length of the domain?');
rho=input('What''s the density of the fluid?');
K=input('What''s the co-efficient of diffusion?');
u=input('What''s the flow velocity?');
nx=input('What''s the number of grid points');
fprintf('Menu\n1)Central  Differencing\n2)Upwind Differencing\n3)Hybrid Differencing\n4)Power Law\n5)Exit\n\n');
Choice=input('Please input the serial number of the process');
if Choice==1
    disp('1D Steady Convection Diffusion Equation by Central Difference Scheme');
    %% Solver
    F=rho*u;
    dx=L/(nx);
    D=K/dx;
    a=(3*D)+(F/2);
    b=-D+(F/2);
    c=(2*D)+F;
    d=-D-(F/2);
    e=2*D;
    f=3*D-(F/2);
    g=(2*D)-F;
    %% Matrix Definition
    A=full(gallery('tridiag',nx,d,e,b));
    A(1,1)=a;
    A(nx,nx)=f;
    B(1,1)=(c*phi1);
    B(nx,1)=(g*phi2);
    B(2:nx-1,1)=0;
    %% Matrix Solution
    var=inv(A)*B;
    %% Plotting
    y(1,1)=phi1;
    y(nx+2,1)=phi2;
    y(2:nx+1,1)=var;
    x(1,1)=0;
    x(1,nx+2)=L;
    x(1,2:nx+1)=[dx/2:dx:L-(dx/2)];
    plot(x,y,'r','LineWidth',2);
    hold on;
    %% Exact Solution
    d=[0:0.00000001:L];
    ex0=(exp(F*d/D)-1)/(exp(F*L/D)-1);
    ex=phi1+((phi2-phi1)*ex0);
    plot(d,ex,'k','LineWidth',2);
    hold on;
    %% Plot Details
    title(['Comparison of Numerical and Exact Solution (Central Difference Scheme)']);
    xlabel('Domain Length(x)');
    ylabel('Field Variable(\Phi)');
    legend('Numerical Solution','Exact Solution');
elseif Choice==2
    disp('1D Steady Convection Diffusion Equation by Upwind Scheme');
    %% Solver
    F=rho*u;
    dx=L/(nx);
    D=K/dx;
    a=(3*D)+F;
    b=D;
    c=(2*D)+F;
    d=D+F;
    %% Matrix Definition
    A=full(gallery('tridiag',nx,-d,c,-b));
    A(1,1)=a;
    A(nx,nx)=a;
    B(1,1)=(c*phi1);
    B(nx,1)=(2*b*phi2);
    B(2:nx-1,1)=0;
    %% Matrix Solution
    var=inv(A)*B;
    %% Plotting
    y(1,1)=phi1;
    y(nx+2,1)=phi2;
    y(2:nx+1,1)=var;
    x(1,1)=0;
    x(1,nx+2)=L;
    x(1,2:nx+1)=[dx/2:dx:L-(dx/2)];
    plot(x,y,'r','LineWidth',2);
    hold on;
    %% Exact Solution
    d=[0:0.00000001:L];
    ex0=(exp(F*d/D)-1)/(exp(F*L/D)-1);
    ex=phi1+((phi2-phi1)*ex0);
    plot(d,ex,'k','LineWidth',2);
    hold on;
    %% Plot Details
    title(['Comparison of Numerical and Exact Solution (Upwind Scheme)']);
    xlabel('Domain Length(x)');
    ylabel('Field Variable(\Phi)');
    legend('Numerical Solution','Exact Solution');
elseif Choice==3
    disp('1D Steady Convection Diffusion Equation by Hybrid Scheme');
    %% Solver
    F=rho*u;
    dx=L/(nx);
    D=K/dx;
    a=(2*D)+F;
    b=F;
    c=2*D;
    %% Matrix Definition
    A=full(gallery('tridiag',nx,-b,b,0));
    A(1,1)=a;
    A(nx,nx)=a;
    B(1,1)=(a*phi1);
    B(nx,1)=(c*phi2);
    B(2:nx-1,1)=0;
    %% Matrix Solution
    var=inv(A)*B;
    %% Plotting
    y(1,1)=phi1;
    y(nx+2,1)=phi2;
    y(2:nx+1,1)=var;
    x(1,1)=0;
    x(1,nx+2)=L;
    x(1,2:nx+1)=[dx/2:dx:L-(dx/2)];
    plot(x,y,'r','LineWidth',2);
    hold on;
    %% Exact Solution
    d=[0:0.00000001:L];
    ex0=(exp(F*d/D)-1)/(exp(F*L/D)-1);
    ex=phi1+((phi2-phi1)*ex0);
    plot(d,ex,'k','LineWidth',2);
    hold on;
    %% Plot Details
    title(['Comparison of Numerical and Exact Solution (Hybrid Scheme)']);
    xlabel('Domain Length(x)');
    ylabel('Field Variable(\Phi)');
    legend('Numerical Solution','Exact Solution');
elseif Choice==4
    disp('1D Steady Convection Diffusion Equation by Power Law Scheme');
    %% Solver
    F=rho*u;
    dx=L/(nx);
    D=K/dx;
    Pe=F/D;
    beta=((1-(0.1*Pe)).^5)./Pe;
    a=(2*F*beta);
    b=-F*(beta+1);
    c=-F*(beta-1);;
    %% Matrix Definition
    A=full(gallery('tridiag',nx,b,a,c));
    B(1,1)=(-b*phi1);
    B(nx,1)=(-c*phi2);
    B(2:nx-1,1)=0;
    %% Matrix Solution
    var=inv(A)*B;
    %% Plotting
    y(1,1)=phi1;
    y(nx+2,1)=phi2;
    y(2:nx+1,1)=var;
    x(1,1)=0;
    x(1,nx+2)=L;
    x(1,2:nx+1)=[dx/2:dx:L-(dx/2)];
    plot(x,y,'r','LineWidth',2);
    hold on;
    %% Exact Solution
    d=[0:0.00000001:L];
    ex0=(exp(F*d/D)-1)/(exp(F*L/D)-1);
    ex=phi1+((phi2-phi1)*ex0);
    plot(d,ex,'k','LineWidth',2);
    hold on;
    %% Plot Details
    title(['Comparison of Numerical and Exact Solution (Power Law Scheme)']);
    xlabel('Domain Length(x)');
    ylabel('Field Variable(\Phi)');
    legend('Numerical Solution','Exact Solution');
elseif Choice==5
    disp('1D Steady Convection Diffusion Equation by QUICK Scheme');
    %% Solver
    F=rho*u;
    dx=L/(nx);
    D=K/dx;
    a=(4*D)+(7/8)*F;
    b=-(4/3*D-3/8*F);
    c=(2*D+3/8*F);
    d=-(D+F);
    e=-(D-3/8*F);
    f=-(D+7/8*F);
    g=(1/8)*F;
    h=4*D-(3/8)*F;
    m=-(4/3*D+6/8*F);
    j=8/3*D+10/8*F;
    k=-1/4*F;
    l=8/3*D-F;
    %% Matrix Definition
    A=full(gallery('tridiag',nx,f,c,e));
    A(1,1)=a;
    A(nx,nx)=h;
    A(2,1)=d;
    A(1,2)=b;
    A(nx,nx-1)=m;
    z=zeros(nx,nx);
    for i=1:nx-2
        v(i)=g;
    end
    n=-2;
    z=diag(v,n);
    A1=plus(A,z);
    B(1,1)=j*phi1;
    B(2,1)=k*phi1;
    B(nx,1)=l*phi2;
    B(3:nx-1,1)=0;
    %% Matrix Solution
    var=inv(A1)*B;
    %% Plotting
    y(1,1)=phi1;
    y(nx+2,1)=phi2;
    y(2:nx+1,1)=var;
    x(1,1)=0;
    x(1,nx+2)=L;
    x(1,2:nx+1)=[dx/2:dx:L-(dx/2)];
    plot(x,y,'r','LineWidth',2);
    hold on;
    %% Exact Solution
    dist=[0:0.00000001:L];
    ex0=(exp(F*dist/D)-1)/(exp(F*L/D)-1);
    ex=phi1+((phi2-phi1)*ex0);
    plot(dist,ex,'k','LineWidth',2);
    hold on;
    %% Plot Details
    title(['Comparison of Numerical and Exact Solution (QUICK Scheme)']);
    xlabel('Domain Length(x)');
    ylabel('Field Variable(\Phi)');
    legend('Numerical Solution','Exact Solution');
else
    disp('Have a Nice Day.Try next time.');
end
%% End of MATLAB Program