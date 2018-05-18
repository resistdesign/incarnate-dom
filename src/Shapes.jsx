import T from 'prop-types';

export const DepencencyDeclarationShape = {
  required: T.arrayOf(
    T.oneOfType([
      T.string,
      T.arrayOf(
        T.string
      )
    ])
  ),
  optional: T.arrayOf(
    T.oneOfType([
      T.string,
      T.arrayOf(
        T.string
      )
    ])
  ),
  getters: T.arrayOf(
    T.oneOfType([
      T.string,
      T.arrayOf(
        T.string
      )
    ])
  ),
  setters: T.arrayOf(
    T.oneOfType([
      T.string,
      T.arrayOf(
        T.string
      )
    ])
  ),
  invalidators: T.arrayOf(
    T.oneOfType([
      T.string,
      T.arrayOf(
        T.string
      )
    ])
  ),
  listeners: T.arrayOf(
    T.oneOfType([
      T.string,
      T.arrayOf(
        T.string
      )
    ])
  ),
  targets: T.arrayOf(
    T.oneOfType([
      T.string,
      T.arrayOf(
        T.string
      )
    ])
  ),
  transformArgs: T.func,
  strictRequired: T.bool,
  handlerAsyncFactoryError: T.func,
  factory: T.func
};
export const SubMapShape = T.objectOf(
  T.oneOfType([
    T.bool,
    T.shape(
      DepencencyDeclarationShape
    )
  ])
);
export const SubMapDeclarationShape = {
  subMap: SubMapShape,
  shared: T.objectOf(
    T.oneOfType([
      T.string,
      T.arrayOf(
        T.string
      )
    ])
  ),
  transformArgs: T.func,
  strictRequired: T.bool,
  handleResolveError: T.func
};
