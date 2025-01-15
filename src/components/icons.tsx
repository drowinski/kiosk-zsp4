import { FaArrowDown, FaArrowLeft, FaArrowRight, FaArrowUp, FaPause, FaPlay } from 'react-icons/fa';
import React from 'react';
import { FaX } from 'react-icons/fa6';

interface IconProps extends React.SVGAttributes<SVGElement> {}

export function PlayIcon(props: IconProps) {
  return <FaPlay {...props} />;
}

export function PauseIcon(props: IconProps) {
  return <FaPause {...props} />;
}

export function ArrowLeftIcon(props: IconProps) {
  return <FaArrowLeft {...props} />;
}

export function ArrowRightIcon(props: IconProps) {
  return <FaArrowRight {...props} />;
}

export function ArrowUpIcon(props: IconProps) {
  return <FaArrowUp {...props} />;
}

export function ArrowDownIcon(props: IconProps) {
  return <FaArrowDown {...props} />;
}

export function XIcon(props: IconProps) {
  return <FaX {...props} />;
}
