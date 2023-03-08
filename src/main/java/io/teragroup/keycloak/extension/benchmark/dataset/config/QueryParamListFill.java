package io.teragroup.keycloak.extension.benchmark.dataset.config;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.FIELD)
public @interface QueryParamListFill {

    String paramName();

    String[] defaultValue() default {};

    boolean required() default false;

    DatasetOperation[] operations();
    
}
