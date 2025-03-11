import React from 'react';
import './Card.css';
export interface CardProps { children?: React.ReactNode; className?: string; }
const Card = ({ children, className }: CardProps) => { return <div className={className}>{children}</div>; };
Card.Header = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>;
Card.Body = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>;
Card.Footer = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>;
export default Card;
