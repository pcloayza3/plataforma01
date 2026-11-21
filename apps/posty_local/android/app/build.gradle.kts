plugins {
    id("com.android.application")
}

android {
    namespace = "com.postylocal.app"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.postylocal.app"
        minSdk = 24
        targetSdk = 35
        versionCode = 9
        versionName = "0.9.0"
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            signingConfig = signingConfigs.getByName("debug")
        }
        debug {
            applicationIdSuffix = ".debug"
        }
    }
}

dependencies {
    implementation("androidx.appcompat:appcompat:1.7.0")
    implementation("androidx.webkit:webkit:1.12.1")
}
