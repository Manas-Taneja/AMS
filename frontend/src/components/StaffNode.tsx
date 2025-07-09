import React, { useState } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { ChevronDown, ChevronRight, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { StaffMember } from "../utils/staffUtils";

export type StaffNodeProps = { node: StaffMember; level?: number };

const StaffNode: React.FC<StaffNodeProps> = ({ node, level = 0 }) => {
  const [open, setOpen] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <motion.div layout className="flex flex-col items-center relative focus:!ring-0">
      <div className="flex flex-col items-center">
        <Card className="bg-white/90 min-w-[180px] text-center z-10 rounded-full">
          <CardContent className="flex flex-col items-center gap-1 py-2 px-3">
            <User className="w-5 h-5 text-blue-600 mb-1" />
            <div className="font-semibold text-black">{node.name}</div>
            <div className="text-xs text-gray-600">{node.designation}</div>
          </CardContent>
        </Card>
        {hasChildren && (
          <Button
            size="icon"
            variant="ghost"
            className="mt-1 !bg-transparent text-black focus:!ring-0 focus:!outline-none hover:!outline-none hover:!border-transparent hover:!bg-transparent"
            onClick={() => setOpen(o => !o)}
            aria-label={open ? "Collapse" : "Expand"}
          >
            {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </Button>
        )}
      </div>
      {/* Children nodes */}
      {hasChildren && (
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              layout
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex justify-center items-start mt-4 relative"
            >
              {/* Horizontal line connecting children */}
              <div className="absolute top-0 left-4 right-4 h-0.5 bg-gray-300 z-0" style={{ marginTop: "-10px" }} />
              {node.children!.map((child) => (
                <div key={child.id} className="flex flex-col items-center mx-4 relative">
                  <StaffNode node={child} level={level + 1} />
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </motion.div>
  );
};

export default StaffNode; 