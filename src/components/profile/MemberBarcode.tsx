import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

interface MemberBarcodeProps {
  memberId: string;
}

export default function MemberBarcode({ memberId }: MemberBarcodeProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (svgRef.current && memberId) {
      JsBarcode(svgRef.current, memberId, {
        format: 'CODE128',
        displayValue: true,
        height: 50,
        margin: 5,
        width: 2,
      });
    }
  }, [memberId]);

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-center items-center overflow-hidden mt-6">
      <svg ref={svgRef} className="max-w-full h-auto"></svg>
    </div>
  );
}
