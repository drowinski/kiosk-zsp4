import {
  FaArrowDown,
  FaArrowLeft,
  FaArrowRight,
  FaArrowUp,
  FaCalendar,
  FaCheck,
  FaChevronDown,
  FaChevronLeft,
  FaChevronRight,
  FaChevronUp,
  FaPenClip,
  FaFilm,
  FaFilter,
  FaImage,
  FaCircleInfo,
  FaPause,
  FaPlay,
  FaPlus,
  FaMagnifyingGlass,
  FaSpinner,
  FaTrash,
  FaUpload,
  FaCircleExclamation,
  FaEllipsis,
  FaPencil,
  FaX
} from 'react-icons/fa6';
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

export function ChevronLeftIcon(props: IconProps) {
  return <FaChevronLeft {...props} />;
}

export function ChevronRightIcon(props: IconProps) {
  return <FaChevronRight {...props} />;
}

export function ChevronUpIcon(props: IconProps) {
  return <FaChevronUp {...props} />;
}

export function ChevronDownIcon(props: IconProps) {
  return <FaChevronDown {...props} />;
}

export function PlusIcon(props: IconProps) {
  return <FaPlus {...props} />;
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
  return <FaPenClip {...props} />;
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

export function FilterIcon(props: IconProps) {
  return <FaFilter {...props} />;
}

export function SearchIcon(props: IconProps) {
  return <FaMagnifyingGlass {...props} />;
}

export function EllipsisIcon(props: IconProps) {
  return <FaEllipsis {...props} />;
}

export function UploadIcon(props: IconProps) {
  return <FaUpload {...props} />;
}

export function InfoIcon(props: IconProps) {
  return <FaCircleInfo {...props} />;
}
