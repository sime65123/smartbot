import React from 'react';
import { CSSTransition } from 'react-transition-group';
import '../../styles/animations.css';

const PageTransition = ({ children, ...props }) => {
  return (
    <CSSTransition
      in={true}
      appear={true}
      timeout={300}
      classNames="page"
      unmountOnExit
      {...props}
    >
      {children}
    </CSSTransition>
  );
};

export default PageTransition;
