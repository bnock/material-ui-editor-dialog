import 'react-quill-2/dist/quill.snow.css';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import moment from 'moment';
import { withStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import InputLabel from '@material-ui/core/InputLabel';
import Switch from '@material-ui/core/Switch';
import InputAdornment from '@material-ui/core/InputAdornment';
import CancelIcon from '@material-ui/icons/Cancel';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import { isValidDate, isValidEmail } from '../utilities/validatorUtility';
import ReactQuill from 'react-quill-2';

export const TEXT_TYPE = 'TEXT_TYPE';
export const TEXT_AREA_TYPE = 'TEXT_AREA_TYPE';
export const RICH_TEXT_AREA_TYPE = 'RICH_TEXT_AREA_TYPE';
export const NUMBER_TYPE = 'NUMBER_TYPE';
export const PASSWORD_TYPE = 'PASSWORD_TYPE';
export const EMAIL_TYPE = 'EMAIL_TYPE';
export const CURRENCY_TYPE = 'CURRENCY_TYPE';
export const TOGGLE_TYPE = 'TOGGLE_TYPE';
export const SELECT_TYPE = 'SELECT_TYPE';
export const PERCENT_TYPE = 'PERCENT_TYPE';
export const DATE_TYPE = 'DATE_TYPE';

const styles = (theme) => ({
    input: {
        marginBottom: theme.spacing(1)
    },
    saveButton: {
        color: theme.palette.primary.main
    }
});

class EditorDialog extends Component {
    static propTypes = {
        formConfig: PropTypes.arrayOf(PropTypes.shape({
            type: PropTypes.oneOf([TEXT_TYPE, TEXT_AREA_TYPE, RICH_TEXT_AREA_TYPE, NUMBER_TYPE, PASSWORD_TYPE,
                EMAIL_TYPE, CURRENCY_TYPE, PERCENT_TYPE, TOGGLE_TYPE, SELECT_TYPE, DATE_TYPE]).isRequired,
            key: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
            required: PropTypes.bool,
            readOnly: PropTypes.bool,
            selectOptions: PropTypes.arrayOf(PropTypes.shape({
                key: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
                label: PropTypes.string.isRequired
            }))
        })).isRequired,
        model: PropTypes.object.isRequired,
        modelName: PropTypes.string.isRequired,
        isNew: PropTypes.bool.isRequired,
        setter: PropTypes.func.isRequired,
        onSave: PropTypes.func.isRequired,
        onCancel: PropTypes.func.isRequired
    };

    onSave = (e) => {
        const { onSave } = this.props;

        e.preventDefault();
        onSave();
    };

    isValid = (value, type, isRequired) => {
        switch (type) {
            case TEXT_TYPE:
            case TEXT_AREA_TYPE:
            case RICH_TEXT_AREA_TYPE:
            case PASSWORD_TYPE:
            case SELECT_TYPE:
                return !isRequired || (isRequired && Boolean(value));

            case EMAIL_TYPE:
                return (value !== '' && value !== null && isValidEmail(value)) ||
                    (!isRequired && (value === '' || value === null));

            case NUMBER_TYPE:
            case CURRENCY_TYPE:
            case PERCENT_TYPE:
                return (value !== '' && value !== null && !isNaN(value) && isFinite(value)) ||
                    (!isRequired && (value === '' || value === null));

            case DATE_TYPE:
                return (value !== '' && value !== null && isValidDate(value)) ||
                    (!isRequired && (value === '' || value === null));

            default:
                return true;
        }
    };

    isFormValid = () => {
        const { formConfig, model } = this.props;

        for (let config of formConfig) {
            if (!this.isValid(get(model, config.key), config.type, config.required)) {
                return false;
            }
        }

        return true;
    };

    render() {
        const { classes, model, modelName, isNew, onCancel, setter, formConfig } = this.props;

        const dialogContent = formConfig.map((config, index) => {
            let htmlType;
            let inputProps = {};
            let inputLabelProps = {};

            switch (config.type) {
                case TEXT_TYPE:
                case TEXT_AREA_TYPE:
                    if (config.readOnly) {
                        inputProps.readOnly = true;
                    }

                    htmlType = 'text';
                    break;

                case CURRENCY_TYPE:
                    inputProps.startAdornment = <InputAdornment position="start">$</InputAdornment>;
                    htmlType = 'number';
                    break;

                case PERCENT_TYPE:
                    inputProps.endAdornment = <InputAdornment position="end">%</InputAdornment>;
                    htmlType = 'number';
                    break;

                case NUMBER_TYPE:
                    htmlType = 'number';
                    break;

                case PASSWORD_TYPE:
                    htmlType = 'password';
                    break;

                case EMAIL_TYPE:
                    htmlType = 'email';
                    break;

                case DATE_TYPE:
                    inputLabelProps.shrink = true;
                    htmlType = 'date';
                    break;
            }

            switch (config.type) {
                case TOGGLE_TYPE:
                    return (
                        <FormControlLabel
                            key={index}
                            control={
                                <Switch
                                    checked={get(model, config.key)}
                                    onChange={(e) => setter(config.key, e.target.checked)}
                                />
                            }
                            label={config.label}
                            className={classes.input}
                        />
                    );

                case RICH_TEXT_AREA_TYPE:
                    return (
                        <FormControl
                            key={index}
                            required={config.required}
                            error={!this.isValid(get(model, config.key), config.type, config.required)}
                            fullWidth={true}
                            className={classes.input}
                        >
                            <InputLabel filled={true} shrink={true}>{config.label}</InputLabel>
                            <ReactQuill
                                value={get(model, config.key)}
                                onChange={(value) => setter(config.key, value)}
                            />

                        </FormControl>
                    );

                default:
                    const value = config.type === DATE_TYPE ?
                        moment(get(model, config.key)).format('YYYY-MM-DD') : get(model, config.key);

                    return (
                        <TextField
                            key={index}
                            autoFocus={index === 0}
                            fullWidth={true}
                            label={config.label}
                            multiline={config.type === TEXT_AREA_TYPE}
                            onChange={(e) => setter(config.key, e.target.value)}
                            placeholder={config.type === DATE_TYPE ? '' : config.label}
                            required={config.required}
                            select={config.type === SELECT_TYPE}
                            type={htmlType}
                            value={value === null ? '' : value}
                            error={!this.isValid(value, config.type, config.required)}
                            InputProps={inputProps}
                            InputLabelProps={inputLabelProps}
                            className={classes.input}
                        >
                            {config.type === SELECT_TYPE && config.selectOptions.map(option => (
                                <MenuItem key={option.key} value={option.key}>{option.label}</MenuItem>
                            ))}
                        </TextField>
                    );
            }
        });


        return (
            <Dialog open={true}>
                <form>
                    <DialogTitle>
                        {isNew ? 'Create' : 'Edit'} {modelName}
                    </DialogTitle>
                    <DialogContent>{dialogContent}</DialogContent>
                    <DialogActions>
                        <Button onClick={() => onCancel()}>
                            <CancelIcon /> Cancel
                        </Button>
                        <Button
                            className={classes.saveButton}
                            type="submit"
                            onClick={(e) => this.onSave(e)}
                            disabled={!this.isFormValid()}
                        >
                            <CheckCircleIcon /> Save
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        )
    }
}

export default withStyles(styles, { withTheme: true })(EditorDialog);
