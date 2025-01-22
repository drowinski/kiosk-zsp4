import {
  FaArrowDown,
  FaArrowLeft,
  FaArrowRight,
  FaArrowUp,
  FaCalendar,
  FaCheck,
  FaEdit,
  FaFilm,
  FaImage,
  FaPause,
  FaPlay,
  FaSpinner,
  FaTrash
} from 'react-icons/fa';
import { FaCircleExclamation, FaPencil, FaX } from 'react-icons/fa6';
import React from 'react';

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

export function SpinnerIcon(props: IconProps) {
  return <FaSpinner {...props} />;
}

export function CheckIcon(props: IconProps) {
  return <FaCheck {...props} />;
}

export function EditIcon(props: IconProps) {
  return <FaEdit {...props} />;
}

export function TrashIcon(props: IconProps) {
  return <FaTrash {...props} />;
}

export function ImageIcon(props: IconProps) {
  return <FaImage {...props} />;
}

export function FilmIcon(props: IconProps) {
  return <FaFilm {...props} />;
}

export function CalendarIcon(props: IconProps) {
  return <FaCalendar {...props} />;
}

export function PencilIcon(props: IconProps) {
  return <FaPencil {...props} />;
}

export function CircleExclamationIcon(props: IconProps) {
  return <FaCircleExclamation {...props} />;
}
