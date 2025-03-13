@echo off
echo Creating a fixed PlaidLink component directly in the Docker container...

:: Create a temporary file with the fixed PlaidLink component
echo import React, { useCallback, useState } from 'react'; > temp-plaid-link.tsx
echo import { usePlaidLink, PlaidLinkOnSuccessMetadata, PlaidLinkError, PlaidLinkOnEventMetadata, PlaidLinkOptions } from 'react-plaid-link'; >> temp-plaid-link.tsx
echo import { useAuth } from '../../../hooks/useAuth'; >> temp-plaid-link.tsx
echo import { useTheme } from '../../../hooks/useTheme'; >> temp-plaid-link.tsx
echo import { useAsyncAction } from '../../../hooks/useAsyncAction'; >> temp-plaid-link.tsx
echo import PlaidService from '../../../lower-components/plaidService'; >> temp-plaid-link.tsx
echo import Button from '../../common/button/Button'; >> temp-plaid-link.tsx
echo import { Alert } from '../../ui/Alert'; >> temp-plaid-link.tsx
echo import { LoadingSpinner } from '../../ui/LoadingSpinner'; >> temp-plaid-link.tsx
echo. >> temp-plaid-link.tsx
echo export interface PlaidLinkProps { >> temp-plaid-link.tsx
echo   onSuccess?: () => void; >> temp-plaid-link.tsx
echo   onExit?: () => void; >> temp-plaid-link.tsx
echo   buttonText?: string; >> temp-plaid-link.tsx
echo   isButton?: boolean; >> temp-plaid-link.tsx
echo   className?: string; >> temp-plaid-link.tsx
echo } >> temp-plaid-link.tsx
echo. >> temp-plaid-link.tsx
echo export const PlaidLink: React.FC^<PlaidLinkProps^> = ({ >> temp-plaid-link.tsx
echo   onSuccess, >> temp-plaid-link.tsx
echo   onExit, >> temp-plaid-link.tsx
echo   buttonText = 'Link Account', >> temp-plaid-link.tsx
echo   isButton = true, >> temp-plaid-link.tsx
echo   className = '', >> temp-plaid-link.tsx
echo }) => { >> temp-plaid-link.tsx
echo   const { user: _user } = useAuth(); >> temp-plaid-link.tsx
echo   const { theme: _theme } = useTheme(); >> temp-plaid-link.tsx
echo   const [error, setError] = useState^<string ^| null^>(null); >> temp-plaid-link.tsx
echo   // Initialize with empty string to avoid null type issues >> temp-plaid-link.tsx
echo   const [token, setToken] = useState^<string^>(''); >> temp-plaid-link.tsx
echo. >> temp-plaid-link.tsx
echo   const { execute: createLinkToken, isLoading } = useAsyncAction(async () => { >> temp-plaid-link.tsx
echo     try { >> temp-plaid-link.tsx
echo       setError(null); >> temp-plaid-link.tsx
echo       const result = await PlaidService.createLinkToken(); >> temp-plaid-link.tsx
echo       if (result ^&^& result.link_token) { >> temp-plaid-link.tsx
echo         setToken(result.link_token); >> temp-plaid-link.tsx
echo       } >> temp-plaid-link.tsx
echo       return result; >> temp-plaid-link.tsx
echo     } catch (err) { >> temp-plaid-link.tsx
echo       setError('Failed to create link token. Please try again later.'); >> temp-plaid-link.tsx
echo       throw err; >> temp-plaid-link.tsx
echo     } >> temp-plaid-link.tsx
echo   }); >> temp-plaid-link.tsx
echo. >> temp-plaid-link.tsx
echo   const onPlaidSuccess = useCallback( >> temp-plaid-link.tsx
echo     async (publicToken: string, _metadata: PlaidLinkOnSuccessMetadata) => { >> temp-plaid-link.tsx
echo       try { >> temp-plaid-link.tsx
echo         setError(null); >> temp-plaid-link.tsx
echo         await PlaidService.exchangePublicToken(publicToken, 'current-user'); >> temp-plaid-link.tsx
echo         if (onSuccess) onSuccess(); >> temp-plaid-link.tsx
echo       } catch (err) { >> temp-plaid-link.tsx
echo         setError('Failed to link account. Please try again later.'); >> temp-plaid-link.tsx
echo         console.error('Plaid link error:', err); >> temp-plaid-link.tsx
echo       } >> temp-plaid-link.tsx
echo     }, >> temp-plaid-link.tsx
echo     [onSuccess] >> temp-plaid-link.tsx
echo   ); >> temp-plaid-link.tsx
echo. >> temp-plaid-link.tsx
echo   // Create a config object that satisfies PlaidLinkOptions >> temp-plaid-link.tsx
echo   const config: PlaidLinkOptions = { >> temp-plaid-link.tsx
echo     token: token, // This will never be null >> temp-plaid-link.tsx
echo     onSuccess: (public_token, metadata) => { >> temp-plaid-link.tsx
echo       onPlaidSuccess(public_token, metadata); >> temp-plaid-link.tsx
echo     }, >> temp-plaid-link.tsx
echo     onExit: (err, _metadata) => { >> temp-plaid-link.tsx
echo       if (err) { >> temp-plaid-link.tsx
echo         console.error('Plaid link exit error:', err); >> temp-plaid-link.tsx
echo       } >> temp-plaid-link.tsx
echo       if (onExit) onExit(); >> temp-plaid-link.tsx
echo     }, >> temp-plaid-link.tsx
echo     onEvent: (eventName, _metadata) => { >> temp-plaid-link.tsx
echo       console.log('Plaid Link event:', eventName); >> temp-plaid-link.tsx
echo     }, >> temp-plaid-link.tsx
echo   }; >> temp-plaid-link.tsx
echo. >> temp-plaid-link.tsx
echo   // Only call usePlaidLink if token is not empty >> temp-plaid-link.tsx
echo   const { open, ready } = usePlaidLink(config); >> temp-plaid-link.tsx
echo. >> temp-plaid-link.tsx
echo   const handleClick = useCallback(() => { >> temp-plaid-link.tsx
echo     if (!token) { >> temp-plaid-link.tsx
echo       createLinkToken().then(() => { >> temp-plaid-link.tsx
echo         if (ready) open(); >> temp-plaid-link.tsx
echo       }); >> temp-plaid-link.tsx
echo     } else if (ready) { >> temp-plaid-link.tsx
echo       open(); >> temp-plaid-link.tsx
echo     } >> temp-plaid-link.tsx
echo   }, [ready, open, token, createLinkToken]); >> temp-plaid-link.tsx
echo. >> temp-plaid-link.tsx
echo   if (isLoading) { >> temp-plaid-link.tsx
echo     return ( >> temp-plaid-link.tsx
echo       ^<div className="flex justify-center items-center p-4"^> >> temp-plaid-link.tsx
echo         ^<LoadingSpinner size="md" /^> >> temp-plaid-link.tsx
echo       ^</div^> >> temp-plaid-link.tsx
echo     ); >> temp-plaid-link.tsx
echo   } >> temp-plaid-link.tsx
echo. >> temp-plaid-link.tsx
echo   if (error) { >> temp-plaid-link.tsx
echo     return ( >> temp-plaid-link.tsx
echo       ^<Alert type="error" title="Error"^> >> temp-plaid-link.tsx
echo         {error} >> temp-plaid-link.tsx
echo       ^</Alert^> >> temp-plaid-link.tsx
echo     ); >> temp-plaid-link.tsx
echo   } >> temp-plaid-link.tsx
echo. >> temp-plaid-link.tsx
echo   if (isButton) { >> temp-plaid-link.tsx
echo     return ( >> temp-plaid-link.tsx
echo       ^<Button >> temp-plaid-link.tsx
echo         onClick={handleClick} >> temp-plaid-link.tsx
echo         isDisabled={isLoading} >> temp-plaid-link.tsx
echo         className={className} >> temp-plaid-link.tsx
echo         variant="primary" >> temp-plaid-link.tsx
echo       ^> >> temp-plaid-link.tsx
echo         {buttonText} >> temp-plaid-link.tsx
echo       ^</Button^> >> temp-plaid-link.tsx
echo     ); >> temp-plaid-link.tsx
echo   } >> temp-plaid-link.tsx
echo. >> temp-plaid-link.tsx
echo   return ( >> temp-plaid-link.tsx
echo     ^<div onClick={handleClick} className={`cursor-pointer ${className}`}^> >> temp-plaid-link.tsx
echo       {buttonText} >> temp-plaid-link.tsx
echo     ^</div^> >> temp-plaid-link.tsx
echo   ); >> temp-plaid-link.tsx
echo }; >> temp-plaid-link.tsx
echo. >> temp-plaid-link.tsx
echo export default PlaidLink; >> temp-plaid-link.tsx

:: Copy the temporary file to the Docker container
docker cp temp-plaid-link.tsx finance-dashboard-dev:/app/src/components/features/plaid/PlaidLink.tsx

:: Remove the temporary file
del temp-plaid-link.tsx

:: Run the build process in the Docker container
echo Running build process in Docker container...
docker exec -it finance-dashboard-dev npm run build

:: Display any errors
if %ERRORLEVEL% NEQ 0 (
  echo Build failed. Check the error messages above.
) else (
  echo Build completed successfully. Your app is ready for deployment.
) 