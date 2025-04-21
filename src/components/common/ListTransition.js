import React from 'react';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import '../../styles/animations.css';

const ListTransition = ({ items, keyExtractor, renderItem }) => {
  return (
    <TransitionGroup component={null}>
      {items.map((item) => (
        <CSSTransition
          key={keyExtractor(item)}
          timeout={300}
          classNames="list"
          unmountOnExit
        >
          {renderItem(item)}
        </CSSTransition>
      ))}
    </TransitionGroup>
  );
};

export default ListTransition;
