sed -i 's/const { pathname } = useLocation();/const { pathname } = useLocation();\n  const action = useNavigationType();/' src/AppPublic.tsx
sed -i 's/window.scrollTo(0, 0);/if (action !== "POP") {\n      window.scrollTo(0, 0);\n    }/' src/AppPublic.tsx
sed -i 's/import { BrowserRouter as Router, Routes, Route, useLocation, useParams, Navigate } from '"'"'react-router-dom'"'"';/import { BrowserRouter as Router, Routes, Route, useLocation, useParams, Navigate, useNavigationType } from '"'"'react-router-dom'"'"';/' src/AppPublic.tsx
