# https://www.youtube.com/watch?v=tv1TlAebvm0&list=PLnT2pATp7adWUaMh0A8jfoN_OHGAmt_m4&index=2
"""
PD: problem dimension
NoE: number of element
NpE: nodes per element
NoN: number of node
ENL: extend node list 6*PD
"""
import numpy as np
import math

from regex import R 

def assign_BCs(NL, ENL):    
    PD = np.size(NL, 1)
    NoN = np.size(NL, 0)
    Dofs = 0
    Docs = 0
    # local Dofs
    for i in range(0, NoN):
        for j in range(0, PD):            
            if ENL[i, PD+j] == -1:
                Docs -= 1
                ENL[i, 2*PD + j] = Docs                
            else:
                Dofs += 1
                ENL[i, 2*PD + j] = Dofs
    # global Dof
    for i in range(0, NoN):
        for j in range(0, PD):
            _curr = ENL[i, 2*PD + j]            
            if _curr < 0:
                ENL[i, 3*PD + j] = abs(_curr) + Dofs
            else:
                ENL[i, 3*PD + j] = abs(_curr)
    Docs = abs(Docs)
    return (ENL, Dofs, Docs)

def element_stiffness(nl, ENL, E, A):
    X1 = ENL[nl[0]-1, 0]
    Y1 = ENL[nl[0]-1, 1]
    X2 = ENL[nl[1]-1, 0]
    Y2 = ENL[nl[1]-1, 1]

    L = math.sqrt((X1-X2)**2 + (Y1-Y2)**2)

    C = (X2 - X1) / L
    S = (Y2 - Y1) / L
    # K element 
    k = (E*A)/L * np.array([
        [C**2, C*S, -C**2, -C*S],
        [C*S, S**2, -C*S, -S**2],
        [-C**2, -C*S, C**2, C*S],
        [-C*S, -S**2, C*S, S**2]
    ])

    return k


# K NoN * PD NoN*PD
def assign_stiffness(ENL, EL, NL, E, A):
    NoE = np.size(EL, 0)
    NpE = np.size(EL, 1)
    PD = np.size(NL, 1)
    NoN = np.size(NL, 0)
    
    K = np.zeros([NoN*PD, NoN*PD])

    for i in range(0, NoE):
        nl = EL[i, 0:NpE]
        #print("nl", nl)
        k = element_stiffness(nl, ENL, E, A)
        # node
        for r in range(0, NpE):
            for p in range(0, PD):
                # coordinate
                for q in range(0, NpE):
                    for s in range(0, PD): 
                        #print("nl[r], p", nl[r], p)   
                        row = ENL[nl[r]-1, p+3*PD]
                        col = ENL[nl[q]-1, s+3*PD]
                        #print(r*PD+q, q*PD+s)
                        value = k[r*PD+p, q*PD+s]
                        #print("int(row)-1,int(col)-1", int(row)-1,int(col)-1)
                        K[int(row)-1,int(col)-1] += value
    return K


def assemble_forces(ENL, NL):
    PD = np.size(NL, 1)
    NoN = np.size(NL, 0)
    Dof = 0
    Fp = []
    for i in range(0, NoN):
        for j in range(0, PD):            
            if ENL[i, PD+j] == 1:
                Dof += 1
                Fp.append(ENL[i, 5*PD+j])
    Fp = np.vstack([Fp]).reshape(-1, 1)
    return Fp

def assemble_displacement(ENL, NL):
    PD = np.size(NL, 1)
    NoN = np.size(NL, 0)
    Doc = 0
    Up = []
    for i in range(0, NoN):
        for j in range(0, PD):            
            if ENL[i, PD+j] == -1:
                Doc += 1
                Up.append(ENL[i, 5*PD+j])
    Up = np.vstack([Up]).reshape(-1, 1)
    return Up

def update_nodes(ENL, U_u, NL, fu):
    PD = np.size(NL, 1)
    NoN = np.size(NL, 0)
    Dofs = 0
    Docs = 0
    for i in range(0, NoN):
        for j in range(0, PD):            
            if ENL[i, PD+j] == 1:
                Dofs += 1
                ENL[i, 4*PD + j] = U_u[Dofs-1]                
            else:
                Docs += 1
                ENL[i, 5*PD + j] = fu[Docs-1]

    return ENL

# shape NoN PD
NL = np.array([
    [0, 0],
    [1, 0],
    [0.5, 1]
])

# shape NoE NpE
EL = np.array([ 
    [1, 2],
    [2, 3],
    [3, 1]
])

# -1 为 迪利克雷边界条件（相当于保持一种状态动不了） 1 为 诺依曼边界条件（移动速率固定）
DorN = np.array([
    [-1, -1],
    [1, -1],
    [1, 1]
])

# 各个点上的受力
fu = np.array([
    [0, 0],
    [0, 0],
    [0, -20]
    ])

U_u = np.array([
    [0, 0],
    [0, 0],
    [0, 0]
    ])

E = 10**6
A = 0.01

# problem of demension
PD = np.size(NL, 1)

# number of node
NoN = np.size(NL, 0)

ENL = np.zeros([NoN, 6*PD])
print(PD, NoN, ENL)

ENL[:, 0:PD] = NL[:,:]
print(ENL)

ENL[:, PD:2*PD] = DorN[:,:]
print(ENL)

# assign boundary condition 
(ENL, DOFs, Docs) = assign_BCs(NL, ENL)

print(ENL, DOFs, Docs)

ENL[:,4*PD:5*PD] = U_u[:,:]
ENL[:,5*PD:6*PD] = fu[:,:]
print("ENL\n", ENL)

U_u = U_u.flatten()
fu = fu.flatten()

print(U_u, fu)

#### 

K = assign_stiffness(ENL, EL, NL, E, A)
print(K.shape)

Fp = assemble_forces(ENL, NL)
Up = assemble_displacement(ENL, NL)

"""
KUU  Dofs Dofs
Kup  Dofs Docs
Kpu  Docs Dofs
Kpp  Docs Docs
"""

K_UU = K[0:DOFs, 0:DOFs]
K_UP = K[0:DOFs, DOFs:DOFs+Docs]
K_PU = K[DOFs:DOFs+Docs, 0:DOFs]
K_PP = K[DOFs:DOFs+Docs, DOFs:DOFs+Docs]

F = Fp - np.matmul(K_UP, Up)
U_u = np.matmul(np.linalg.inv(K_UU), F)
fu = np.matmul(K_PU, U_u) + np.matmul(K_PP, Up)

ENl = update_nodes(ENL, U_u, NL, fu)

print(ENl)