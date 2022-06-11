%% Matlab script for testing the elastic collision between two bodies 
%% Written by Philippe Lucidarme
%% https://lucidar.me/en/mechanics/elastic-collision-equations-simulation/

close all;
clear all;
clc;

% Body 1 properties
m1=1;
r1=2;
X1=[3,3];
V1=[0.01,0.0];

% Body 2 properties
m2=2;
r2=2.25;
X2=[10,4];
V2=[-0.05,0];

% Background
patch([0,0,14,14],[0,10,10,0],'g','FaceAlpha',0.5);
grid on;
axis square equal;
hold on;

% Draw the circles (graphical items)
a=[0:0.1:2*pi];
Xcircle=cos(a);
Ycircle=sin(a);
GM1=patch (X1(1)+r1*Xcircle, X1(2)+r1*Ycircle,'r','FaceAlpha',1);
GM2=patch (X2(1)+r2*Xcircle, X2(2)+r2*Ycircle,'b','FaceAlpha',1);

for i=1:5000
    % Motion engin

    % Update position
    X1=X1+V1;
    X2=X2+V2;

    % Check for collision with playground's borders for body 1
    if (X1(1)<=r1)      X1(1)=r1;       V1(1)=-V1(1); end
    if (X1(1)>=14-r1)   X1(1)=14-r1;    V1(1)=-V1(1); end    
    if (X1(2)<=r1)      X1(2)=r1;       V1(2)=-V1(2); end
    if (X1(2)>=10-r1)   X1(2)=10-r1;    V1(2)=-V1(2); end

    % Check for collision with playground's borders for body 2
    if (X2(1)<=r2)      X2(1)=r2;       V2(1)=-V2(1); end
    if (X2(1)>=14-r2)   X2(1)=14-r2;    V2(1)=-V2(1); end    
    if (X2(2)<=r2)      X2(2)=r2;       V2(2)=-V2(2); end
    if (X2(2)>=10-r2)   X2(2)=10-r2;    V2(2)=-V2(2); end

    % Check for collision: 
    % if bodies overlaps a collision occured
    if (norm (X1-X2)<=r1+r2)

        % Copy velocity vectors
        u1=V1;
        u2=V2;

        % 1 - Compute angles
        Alpha1=atan2(X2(2)-X1(2) , X2(1)-X1(1) );
        Beta1=atan2(u1(2),u1(1));
        Gamma1=Beta1-Alpha1;

        % 2 - Compute norm of vectors after decomposition
        u12=norm(u1)*cos(Gamma1);
        u11=norm(u1)*sin(Gamma1);

        % 3 - Repeat 1 and 2 for the second boody
        Alpha2=atan2(X1(2)-X2(2) , X1(1)-X2(1) );
        Beta2=atan2(u2(2),u2(1));
        Gamma2=Beta2-Alpha2;
        u21=norm(u2)*cos(Gamma2);
        u22=norm(u2)*sin(Gamma2);

        % 4 - Compute norm of sub vectors after collision
        v12 = ( (m1-m2)*u12 - 2*m2*u21 ) / (m1+m2);
        v21 = ( (m1-m2)*u21 + 2*m1*u12 ) / (m1+m2);

        % 5 and 6 compute velocities after collision
        V1=u11*[-sin(Alpha1),cos(Alpha1)] + v12*[cos(Alpha1),sin(Alpha1)];
        V2=u22*[-sin(Alpha2),cos(Alpha2)] - v21*[cos(Alpha2),sin(Alpha2)];

    end

    % Update display    
    set(GM1,'XData',X1(1)+r1*Xcircle, 'YData', X1(2)+r1*Ycircle);
    set(GM2,'XData',X2(1)+r2*Xcircle, 'YData', X2(2)+r2*Ycircle);

    drawnow;
    F(i) = getframe(gcf);

end

writerObj = VideoWriter('elasticCollision.avi');
writerObj.FrameRate = 60;
writerObj.Quality = 100;

% open the video writer
open(writerObj);
% write the frames to the video
for i=1:length(F)
    % convert the image to a frame
    frame = F(i) ;    
    writeVideo(writerObj, frame);
end
% close the writer object
close(writerObj);