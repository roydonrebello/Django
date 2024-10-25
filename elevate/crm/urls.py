from django.urls import path

from . import views

urlpatterns = [

    path('', views.homepage, name=""),

    path('register', views.register, name="register"),

    path('my-login', views.my_login, name="my-login"),

    path('dashboard', views.dashboard, name="dashboard"),

    path('user-logout', views.user_logout, name="user-logout"),

    path('home', views.home, name="home"),

    path('cache', views.cache, name="cache"),

    path('style2',views.style2,name="style2")
    
]










