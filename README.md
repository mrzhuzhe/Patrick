# Patrick

> Learn Numeric analysis



## Projects 

```
//  compute 1d convexhull
geo/contour/calculate_normal.py

//  compute 3d mesh normal
circle-geo.py

//  compute 3d convexhull but only single thread take 37 min for 35779 points
python3 hull.py data/rd9c37-lq-wholePoint.asc
```

## Install 

for using taichi mesh 

```
cd meshtaichi_patcher
git submodule update --init
pip install -r requirements.txt
python3 setup.py develop --user

```

Refferernces

1. https://github.com/yhesper/TaichiSimplicialFluid
2. 3d convexhull implement
    Overview: http://www.bowdoin.edu/~ltoma/teaching/cs3250-CompGeom/spring17/Lectures/cg-hull3d.pdf
    quickhull https://github.com/swapnil96/Convex-hull
    JS quickhull https://github.com/mauriciopoppe/quickhull3d
    increament hull https://github.com/Dung-Han-Lee/Convexhull-3D-Implementation-of-incremental-convexhull-algorithm
    cudahull qhull 
    CGAL

Some new refferences in numeric analysis

1. lapack 源码： GitHub - Reference-LAPACK/lapack: LAPACK development repository
2. numerical recipes in C https://www.cec.uchile.cl/cinetica/pcordero/MC_libros/NumericalRecipesinC.pdf
最近似乎还真出了 numerical recipes in C++ 和 numerical recipes in python
3. 自动微分的详细讲解 Differentiable Programming from Scratch – Max Slater – Computer Graphics, Programming, and Math

